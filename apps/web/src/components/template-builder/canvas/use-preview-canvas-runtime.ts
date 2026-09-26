"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { getPreviewLayoutKey } from "@repo/shared";
import { useRenderedPreview } from "@/lib/templates/use-rendered-preview";
import {
  useBuilder,
  useBuilderStore,
  useSaveRevision,
} from "../builder-provider";
import { runBuilderShortcut } from "../run-builder-shortcut";
import { buildCanvasBridgeDocument } from "./canvas-bridge";
import {
  isBuilderShortcutMessage,
  type CanvasBridgeOutboundMessage,
} from "./canvas-bridge-protocol";
import {
  createCanvasPreviewController,
  type CanvasPreviewController,
} from "./canvas-preview-controller";
import { usePaletteCanvasDnd } from "./palette-canvas-dnd-context";
import { useCanvasViewportAutoScroll } from "./use-canvas-viewport-auto-scroll";
import {
  useRichtextCanvasEdit,
  type RichtextCommand,
} from "./richtext-canvas-edit-context";
import { selectedBlockLabel } from "./selection-path";

export function usePreviewCanvasRuntime(
  scrollContainerRef: RefObject<HTMLDivElement | null>,
) {
  const store = useBuilderStore();
  const content = useBuilder((s) => s.content);
  const canEdit = useBuilder((s) => s.canEdit);
  const previewDevice = useBuilder((s) => s.previewDevice);
  const {
    session: richtextSession,
    startEdit: startRichtextEdit,
    endEdit: endRichtextEdit,
    commitEdit: commitRichtextEdit,
    setFormatState,
    registerCommandSink,
  } = useRichtextCanvasEdit();
  const {
    registerDragBridge,
    handleIframeMessage,
    handleDropTargetChange,
    cancelAllDrags,
    isPaletteDragging,
    isCanvasDragging,
  } = usePaletteCanvasDnd();
  const { saveRevision, isPending: isSaving } = useSaveRevision();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const srcDocRef = useRef("");
  const controllerRef = useRef<CanvasPreviewController | null>(null);
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");
  const [plainTextEditPaused, setPlainTextEditPaused] = useState(false);
  const previewPaused = plainTextEditPaused || richtextSession !== null;
  const { html, debouncedHash, previewMatchesContent, syncDebouncedHash } =
    useRenderedPreview(content, true, previewPaused);
  const previewSyncRef = useRef({
    html: "",
    debouncedHash: "",
    previewMatchesContent: false,
  });

  const postToIframe = useCallback((message: CanvasBridgeOutboundMessage) => {
    iframeRef.current?.contentWindow?.postMessage(message, "*");
  }, []);

  useLayoutEffect(() => {
    previewSyncRef.current = {
      html,
      debouncedHash,
      previewMatchesContent,
    };
  }, [debouncedHash, html, previewMatchesContent]);

  useLayoutEffect(() => {
    if (controllerRef.current) {
      return;
    }

    const created = createCanvasPreviewController({
      getContent: () => store.getState().content,
      getHtml: () => previewSyncRef.current.html,
      getDebouncedHash: () => previewSyncRef.current.debouncedHash,
      getPreviewMatchesContent: () =>
        previewSyncRef.current.previewMatchesContent,
      getSelectedBlockId: () => store.getState().selectedBlockId,
      getSelectedLabel: () => {
        const state = store.getState();
        return selectedBlockLabel(state.content, state.selectedBlockId);
      },
      getCanEdit: () => store.getState().canEdit,
      selectBlock: (blockId) => store.getState().selectBlock(blockId),
      updateBlockProps: (blockId, props, options) =>
        store.getState().updateBlockProps(blockId, props, options),
      beginInlineEditSession: () => store.getState().beginInlineEditSession(),
      commitInlineEditSession: () => store.getState().commitInlineEditSession(),
      revertInlineEditSession: () => store.getState().revertInlineEditSession(),
      onPlainTextEditPausedChange: setPlainTextEditPaused,
      startRichtextEdit,
      endRichtextEdit,
      setFormatState,
      onReload: (htmlToRender, layoutKey) => {
        const built = buildCanvasBridgeDocument(htmlToRender, {
          canEdit: store.getState().canEdit,
        });
        created.applyReloadState(
          layoutKey,
          previewSyncRef.current.debouncedHash,
        );
        srcDocRef.current = built;
        setIframeSrcDoc(built);
      },
      onPatch: (htmlToRender, nextHash) => {
        postToIframe({ type: "update-preview", html: htmlToRender });
        created.appliedHtmlHashRef.current = nextHash;
      },
      onSelectBlockPosted: (blockId, label) => {
        postToIframe({ type: "select-block", blockId, label });
      },
      onDropTargetChange: handleDropTargetChange,
    });
    controllerRef.current = created;
  }, [
    handleDropTargetChange,
    postToIframe,
    setFormatState,
    startRichtextEdit,
    endRichtextEdit,
    store,
  ]);

  useCanvasViewportAutoScroll({
    scrollContainerRef,
    iframeRef,
    isActive: isPaletteDragging || isCanvasDragging,
  });

  useEffect(() => {
    cancelAllDrags();
  }, [cancelAllDrags, previewDevice]);

  useLayoutEffect(() => {
    registerDragBridge({
      postToIframe,
      getCanvasIframe: () => iframeRef.current,
      getDropArea: () => scrollContainerRef.current,
      getContent: () => store.getState().content,
      prepareDrag: () => {
        postToIframe({ type: "canvas-prepare-drag" });
        commitRichtextEdit();
        setPlainTextEditPaused(false);
      },
      onDropCommitted: () => {
        syncDebouncedHash();
        controllerRef.current?.requestStructuralSync();
      },
    });

    return () => registerDragBridge(null);
  }, [
    commitRichtextEdit,
    postToIframe,
    registerDragBridge,
    scrollContainerRef,
    store,
    syncDebouncedHash,
  ]);

  useEffect(() => {
    registerCommandSink((command: RichtextCommand) => postToIframe(command));
    return () => registerCommandSink(null);
  }, [postToIframe, registerCommandSink]);

  const layoutKey = getPreviewLayoutKey(content);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }

    const action = controller.resolvePreviewUpdate({
      effectiveHtml: html,
      layoutKey,
      debouncedHash,
      canEdit,
      previewPaused,
      previewMatchesContent,
      hasSrcDoc: Boolean(srcDocRef.current),
      iframeReady: controller.iframeReadyRef.current,
    });

    if (action === "reload") {
      const built = buildCanvasBridgeDocument(html, { canEdit });
      controller.applyReloadState(layoutKey, debouncedHash);
      srcDocRef.current = built;
      setIframeSrcDoc(built);
      return;
    }

    if (action === "patch") {
      postToIframe({ type: "update-preview", html });
      controller.appliedHtmlHashRef.current = debouncedHash;
    }
  }, [
    canEdit,
    debouncedHash,
    html,
    layoutKey,
    postToIframe,
    previewMatchesContent,
    previewPaused,
  ]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const data = event.data;
      if (isBuilderShortcutMessage(data)) {
        const state = store.getState();
        runBuilderShortcut(data.action, {
          canEdit: state.canEdit,
          isSaving,
          previewOpen: state.previewOpen,
          selectedBlockId: state.selectedBlockId,
          undo: state.undo,
          redo: state.redo,
          save: () => {
            void saveRevision();
          },
          openPreview: () => state.setPreviewOpen(true),
          removeBlock: state.removeBlock,
          duplicateBlock: state.duplicateBlock,
          nudgeBlock: state.nudgeBlock,
          copyBlockStyle: state.copyBlockStyle,
          pasteBlockStyle: state.pasteBlockStyle,
          openSaveLibrary: state.openSaveLibrary,
          selectBlock: state.selectBlock,
        });
        return;
      }

      if (handleIframeMessage(data)) {
        return;
      }

      controllerRef.current?.handleMessage(data, event.source);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [handleIframeMessage, isSaving, saveRevision, store]);

  useEffect(() => {
    if (!richtextSession) {
      controllerRef.current?.clearRichtextPause();
    }
  }, [richtextSession]);

  function handleIframeLoad() {
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }

    const sync = previewSyncRef.current;
    const state = store.getState();
    const nextLayoutKey = getPreviewLayoutKey(state.content);
    const action = controller.resolvePreviewUpdate({
      effectiveHtml: sync.html,
      layoutKey: nextLayoutKey,
      debouncedHash: sync.debouncedHash,
      canEdit: state.canEdit,
      previewPaused,
      previewMatchesContent: sync.previewMatchesContent,
      hasSrcDoc: Boolean(srcDocRef.current),
      iframeReady: true,
    });

    controller.markIframeReady();
    postToIframe({
      type: "select-block",
      blockId: state.selectedBlockId,
      label: selectedBlockLabel(state.content, state.selectedBlockId),
    });

    if (action === "patch") {
      postToIframe({ type: "update-preview", html: sync.html });
      controller.appliedHtmlHashRef.current = sync.debouncedHash;
    }
  }

  return {
    iframeRef,
    iframeSrcDoc,
    handleIframeLoad,
    postToIframe,
  };
}

export function CanvasIframeSelectionBridge({
  postToIframe,
}: {
  postToIframe: (message: CanvasBridgeOutboundMessage) => void;
}) {
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const selectedLabel = useBuilder((s) =>
    selectedBlockLabel(s.content, s.selectedBlockId),
  );
  const { session, commitEdit } = useRichtextCanvasEdit();

  useEffect(() => {
    postToIframe({
      type: "select-block",
      blockId: selectedBlockId,
      label: selectedLabel,
    });
  }, [postToIframe, selectedBlockId, selectedLabel]);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (selectedBlockId !== session.blockId) {
      commitEdit();
    }
  }, [commitEdit, selectedBlockId, session]);

  return null;
}
