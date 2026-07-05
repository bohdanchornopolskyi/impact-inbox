import {
  findBlock,
  getPreviewLayoutKey,
  needsPreviewFullReload,
  sanitizeRichtextHtml,
  type CanvasDropTarget,
  type TemplateContentData,
} from "@repo/shared";
import type {
  BlockEditCancelMessage,
  BlockEditCommitMessage,
  BlockEditStartMessage,
  BlockEditSyncMessage,
  RichtextFormatStateData,
  RichtextFormatStateMessage,
} from "./canvas-bridge";
import {
  isBlockEditCancelMessage,
  isBlockEditCommitMessage,
  isBlockEditStartMessage,
  isBlockEditSyncMessage,
  isBlockSelectMessage,
  isCanvasDropTargetMessage,
  isPreviewNeedsReloadMessage,
  isRichtextFormatStateMessage,
} from "./canvas-bridge";

export type PreviewUpdateAction = "none" | "reload" | "patch";

export type PreviewSyncInput = {
  effectiveHtml: string;
  layoutKey: string;
  debouncedHash: string;
  canEdit: boolean;
  previewPaused: boolean;
  previewMatchesContent: boolean;
  hasSrcDoc: boolean;
  appliedLayoutKey: string;
  appliedCanEdit: boolean;
  appliedHtmlHash: string;
  iframeReady: boolean;
};

export function resolvePreviewUpdate(input: PreviewSyncInput): PreviewUpdateAction {
  if (!input.effectiveHtml || input.previewPaused) {
    return "none";
  }

  if (!input.previewMatchesContent) {
    return "none";
  }

  if (
    needsPreviewFullReload({
      hasSrcDoc: input.hasSrcDoc,
      layoutKey: input.layoutKey,
      appliedLayoutKey: input.appliedLayoutKey,
      canEdit: input.canEdit,
      appliedCanEdit: input.appliedCanEdit,
    })
  ) {
    return "reload";
  }

  if (input.appliedHtmlHash === input.debouncedHash) {
    return "none";
  }

  if (!input.iframeReady) {
    return "none";
  }

  return "patch";
}

export function resolveEffectiveHtml(
  previewPaused: boolean,
  html: string,
  pausedHtml: string | null,
): string {
  if (previewPaused && pausedHtml !== null) {
    return pausedHtml;
  }
  return html;
}

export function sanitizeEditValue(prop: string, value: string): string {
  return prop === "html" ? sanitizeRichtextHtml(value) : value;
}

export type CanvasPreviewControllerDeps = {
  getContent: () => TemplateContentData;
  getHtml: () => string;
  getDebouncedHash: () => string;
  getPreviewMatchesContent: () => boolean;
  getSelectedBlockId: () => string | null;
  getSelectedLabel: () => string | null;
  getCanEdit: () => boolean;
  selectBlock: (blockId: string) => void;
  updateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  onPlainTextEditPausedChange: (paused: boolean) => void;
  startRichtextEdit: (session: { blockId: string }) => void;
  endRichtextEdit: () => void;
  setFormatState: (state: RichtextFormatStateData) => void;
  onReload: (html: string, layoutKey: string) => void;
  onPatch: (html: string, debouncedHash: string) => void;
  onSelectBlockPosted: (blockId: string | null, label: string | null) => void;
  onDropTargetChange?: (target: CanvasDropTarget | null) => void;
};

export type CanvasPreviewController = {
  layoutKeyRef: { current: string };
  appliedHtmlHashRef: { current: string };
  iframeReadyRef: { current: boolean };
  canEditRef: { current: boolean };
  pausedHtmlRef: { current: string | null };
  richtextSnapshotRef: { current: { blockId: string; html: string } | null };
  resolvePreviewUpdate: (input: Omit<PreviewSyncInput, "appliedLayoutKey" | "appliedCanEdit" | "appliedHtmlHash" | "hasSrcDoc"> & {
    hasSrcDoc: boolean;
  }) => PreviewUpdateAction;
  applyReloadState: (layoutKey: string, debouncedHash: string) => void;
  markIframeReady: () => void;
  resetIframeReady: () => void;
  handleMessage: (
    data: unknown,
    iframeWindow: MessageEventSource | null,
  ) => void;
  clearRichtextPause: () => void;
  requestStructuralSync: () => void;
};

export function createCanvasPreviewController(
  deps: CanvasPreviewControllerDeps,
): CanvasPreviewController {
  const layoutKeyRef = { current: "" };
  const appliedHtmlHashRef = { current: "" };
  const iframeReadyRef = { current: false };
  const canEditRef = { current: deps.getCanEdit() };
  const pausedHtmlRef = { current: null as string | null };
  const richtextSnapshotRef = {
    current: null as { blockId: string; html: string } | null,
  };

  canEditRef.current = deps.getCanEdit();

  function resolveControllerPreviewUpdate(
    input: Omit<PreviewSyncInput, "appliedLayoutKey" | "appliedCanEdit" | "appliedHtmlHash">,
  ): PreviewUpdateAction {
    return resolvePreviewUpdate({
      ...input,
      appliedLayoutKey: layoutKeyRef.current,
      appliedCanEdit: canEditRef.current,
      appliedHtmlHash: appliedHtmlHashRef.current,
    });
  }

  function applyReloadState(layoutKey: string, debouncedHash: string) {
    layoutKeyRef.current = layoutKey;
    canEditRef.current = deps.getCanEdit();
    appliedHtmlHashRef.current = debouncedHash;
    iframeReadyRef.current = false;
  }

  function readRichtextHtml(blockId: string): string {
    const found = findBlock(deps.getContent(), blockId);
    if (found?.block.type === "richtext") {
      return String((found.block.props as { html?: string }).html ?? "");
    }
    return "";
  }

  function handleEditStart(message: BlockEditStartMessage) {
    pausedHtmlRef.current = deps.getHtml();
    if (message.editKind === "richtext") {
      richtextSnapshotRef.current = {
        blockId: message.blockId,
        html: readRichtextHtml(message.blockId),
      };
      deps.startRichtextEdit({ blockId: message.blockId });
      return;
    }

    deps.selectBlock(message.blockId);
    queueMicrotask(() => deps.onPlainTextEditPausedChange(true));
  }

  function handleEditCommit(message: BlockEditCommitMessage) {
    deps.updateBlockProps(message.blockId, {
      [message.prop]: sanitizeEditValue(message.prop, message.value),
    });
    richtextSnapshotRef.current = null;
    pausedHtmlRef.current = null;
    appliedHtmlHashRef.current = "";
    deps.onPlainTextEditPausedChange(false);
    deps.endRichtextEdit();
  }

  function handleEditSync(message: BlockEditSyncMessage) {
    const value = sanitizeEditValue(message.prop, message.value);
    deps.updateBlockProps(message.blockId, {
      [message.prop]: value,
    });
    if (message.prop === "html") {
      richtextSnapshotRef.current = {
        blockId: message.blockId,
        html: value,
      };
    }
  }

  function handleEditCancel(message: BlockEditCancelMessage) {
    const snapshot = richtextSnapshotRef.current;
    if (snapshot && snapshot.blockId === message.blockId) {
      deps.updateBlockProps(snapshot.blockId, { html: snapshot.html });
    }
    richtextSnapshotRef.current = null;
    pausedHtmlRef.current = null;
    deps.onPlainTextEditPausedChange(false);
    deps.endRichtextEdit();
    deps.onSelectBlockPosted(
      deps.getSelectedBlockId(),
      deps.getSelectedLabel(),
    );
  }

  function handleFormatState(message: RichtextFormatStateMessage) {
    if (message.blockId !== deps.getSelectedBlockId()) {
      return;
    }
    deps.setFormatState(message.state);
  }

  function handlePreviewNeedsReload() {
    deps.onReload(deps.getHtml(), getPreviewLayoutKey(deps.getContent()));
  }

  return {
    layoutKeyRef,
    appliedHtmlHashRef,
    iframeReadyRef,
    canEditRef,
    pausedHtmlRef,
    richtextSnapshotRef,
    resolvePreviewUpdate: resolveControllerPreviewUpdate,
    applyReloadState,
    markIframeReady: () => {
      iframeReadyRef.current = true;
    },
    resetIframeReady: () => {
      iframeReadyRef.current = false;
    },
    clearRichtextPause: () => {
      pausedHtmlRef.current = null;
    },
    requestStructuralSync: () => {
      appliedHtmlHashRef.current = "";
    },
    handleMessage(data, iframeWindow) {
      if (isBlockSelectMessage(data)) {
        deps.selectBlock(data.blockId);
        return;
      }

      if (isBlockEditStartMessage(data)) {
        handleEditStart(data);
        return;
      }

      if (isBlockEditCommitMessage(data)) {
        handleEditCommit(data);
        return;
      }

      if (isBlockEditSyncMessage(data)) {
        handleEditSync(data);
        return;
      }

      if (isBlockEditCancelMessage(data)) {
        handleEditCancel(data);
        return;
      }

      if (isRichtextFormatStateMessage(data)) {
        handleFormatState(data);
        return;
      }

      if (isCanvasDropTargetMessage(data)) {
        deps.onDropTargetChange?.(data.target);
        return;
      }

      if (isPreviewNeedsReloadMessage(data)) {
        handlePreviewNeedsReload();
      }

      void iframeWindow;
    },
  };
}
