import {
  isCanvasDropTarget,
  type CanvasDropTarget,
} from "@repo/shared";

export const CANVAS_DRAG_KINDS = [
  "content",
  "section",
  "row",
  "column",
] as const;

export type CanvasDragKind = (typeof CANVAS_DRAG_KINDS)[number];

export const RICHTEXT_HEADING_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
] as const;

export type RichtextHeadingTag = (typeof RICHTEXT_HEADING_TAGS)[number];

export type RichtextFormatStateData = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  heading: RichtextHeadingTag;
};

export type BlockSelectMessage = {
  type: "block-select";
  blockId: string;
};

export type BlockEditStartMessage = {
  type: "block-edit-start";
  blockId: string;
  editKind?: "plain" | "richtext";
};

export type BlockEditCommitMessage = {
  type: "block-edit-commit";
  blockId: string;
  prop: string;
  value: string;
};

export type BlockEditSyncMessage = {
  type: "block-edit-sync";
  blockId: string;
  prop: string;
  value: string;
};

export type BlockEditCancelMessage = {
  type: "block-edit-cancel";
  blockId: string;
};

export type RichtextFormatStateMessage = {
  type: "richtext-format-state";
  blockId: string;
  state: RichtextFormatStateData;
};

export type PreviewNeedsReloadMessage = {
  type: "preview-needs-reload";
};

export type CanvasDropTargetMessage = {
  type: "canvas-drop-target";
  target: CanvasDropTarget | null;
  dragKind?: CanvasDragKind | null;
  dragBlockId?: string | null;
};

export type CanvasPaletteDragCommitMessage = {
  type: "canvas-palette-drag-commit";
  target: CanvasDropTarget | null;
};

export type CanvasDragHandleDownMessage = {
  type: "canvas-drag-handle-down";
  blockId: string;
  clientX: number;
  clientY: number;
};

export type CanvasDragActiveMessage = {
  type: "canvas-drag-active";
  blockId: string;
  dragKind: CanvasDragKind;
};

export type CanvasDragCommitMessage = {
  type: "canvas-drag-commit";
  blockId: string;
  target: CanvasDropTarget | null;
};

export type CanvasDragPointerMessage = {
  type: "canvas-drag-pointer";
  clientY: number;
};

export type HistoryUndoMessage = {
  type: "history-undo";
};

export type HistoryRedoMessage = {
  type: "history-redo";
};

export type BuilderShortcutMessage = {
  type: "builder-shortcut";
  action: "undo" | "redo" | "save" | "preview" | "delete" | "deselect";
};

export type CanvasBridgeInboundMessage =
  | BlockSelectMessage
  | BlockEditStartMessage
  | BlockEditCommitMessage
  | BlockEditSyncMessage
  | BlockEditCancelMessage
  | RichtextFormatStateMessage
  | PreviewNeedsReloadMessage
  | CanvasDropTargetMessage
  | CanvasPaletteDragCommitMessage
  | CanvasDragHandleDownMessage
  | CanvasDragActiveMessage
  | CanvasDragCommitMessage
  | CanvasDragPointerMessage
  | HistoryUndoMessage
  | HistoryRedoMessage
  | BuilderShortcutMessage;

export type SelectBlockMessage = {
  type: "select-block";
  blockId: string | null;
  label?: string | null;
};

export type UpdatePreviewMessage = {
  type: "update-preview";
  html: string;
};

export type RichtextFormatCommandMessage = {
  type: "richtext-format";
  blockId: string;
  command: string;
  value?: string;
};

export type RichtextSetHeadingMessage = {
  type: "richtext-set-heading";
  blockId: string;
  tag: RichtextHeadingTag;
};

export type RichtextCommitMessage = {
  type: "richtext-commit";
};

export type RichtextCancelMessage = {
  type: "richtext-cancel";
};

export type CanvasPrepareDragMessage = {
  type: "canvas-prepare-drag";
};

export type CanvasCancelDragMessage = {
  type: "canvas-cancel-drag";
};

export type CanvasPaletteDragStartMessage = {
  type: "canvas-palette-drag-start";
  dragKind: CanvasDragKind;
  clientX: number;
  clientY: number;
};

export type CanvasPaletteDragMoveMessage = {
  type: "canvas-palette-drag-move";
  clientX: number;
  clientY: number;
};

export type CanvasPaletteDragEndMessage = {
  type: "canvas-palette-drag-end";
};

export type CanvasPaletteDragFinishMessage = {
  type: "canvas-palette-drag-finish";
};

export type CanvasBridgeOutboundMessage =
  | SelectBlockMessage
  | UpdatePreviewMessage
  | RichtextFormatCommandMessage
  | RichtextSetHeadingMessage
  | RichtextCommitMessage
  | RichtextCancelMessage
  | CanvasPrepareDragMessage
  | CanvasCancelDragMessage
  | CanvasPaletteDragStartMessage
  | CanvasPaletteDragMoveMessage
  | CanvasPaletteDragEndMessage
  | CanvasPaletteDragFinishMessage;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function isCanvasDragKind(value: unknown): value is CanvasDragKind {
  return (
    typeof value === "string" &&
    (CANVAS_DRAG_KINDS as readonly string[]).includes(value)
  );
}

export function isBlockSelectMessage(
  data: unknown,
): data is BlockSelectMessage {
  if (!isRecord(data)) {
    return false;
  }

  return data.type === "block-select" && typeof data.blockId === "string";
}

export function isBlockEditStartMessage(
  data: unknown,
): data is BlockEditStartMessage {
  if (!isRecord(data)) {
    return false;
  }

  if (data.type !== "block-edit-start" || typeof data.blockId !== "string") {
    return false;
  }

  if (data.editKind !== undefined) {
    if (data.editKind !== "plain" && data.editKind !== "richtext") {
      return false;
    }
  }

  return true;
}

export function isBlockEditCommitMessage(
  data: unknown,
): data is BlockEditCommitMessage {
  if (!isRecord(data)) {
    return false;
  }

  return (
    data.type === "block-edit-commit" &&
    typeof data.blockId === "string" &&
    typeof data.prop === "string" &&
    typeof data.value === "string"
  );
}

export function isBlockEditSyncMessage(
  data: unknown,
): data is BlockEditSyncMessage {
  if (!isRecord(data)) {
    return false;
  }

  return (
    data.type === "block-edit-sync" &&
    typeof data.blockId === "string" &&
    typeof data.prop === "string" &&
    typeof data.value === "string"
  );
}

export function isBlockEditCancelMessage(
  data: unknown,
): data is BlockEditCancelMessage {
  if (!isRecord(data)) {
    return false;
  }

  return data.type === "block-edit-cancel" && typeof data.blockId === "string";
}

export function isRichtextFormatStateMessage(
  data: unknown,
): data is RichtextFormatStateMessage {
  if (!isRecord(data)) {
    return false;
  }

  if (
    data.type !== "richtext-format-state" ||
    typeof data.blockId !== "string"
  ) {
    return false;
  }

  if (!isRecord(data.state)) {
    return false;
  }

  const state = data.state;
  for (const key of ["bold", "italic", "underline"] as const) {
    if (typeof state[key] !== "boolean") {
      return false;
    }
  }

  if (
    typeof state.heading !== "string" ||
    !RICHTEXT_HEADING_TAGS.includes(state.heading as RichtextHeadingTag)
  ) {
    return false;
  }

  return true;
}

export function isPreviewNeedsReloadMessage(
  data: unknown,
): data is PreviewNeedsReloadMessage {
  if (!isRecord(data)) {
    return false;
  }

  return data.type === "preview-needs-reload";
}

export function isCanvasDropTargetMessage(
  data: unknown,
): data is CanvasDropTargetMessage {
  if (!isRecord(data) || data.type !== "canvas-drop-target") {
    return false;
  }

  if (data.target === null) {
    return true;
  }

  return isCanvasDropTarget(data.target);
}

export function isCanvasPaletteDragCommitMessage(
  data: unknown,
): data is CanvasPaletteDragCommitMessage {
  if (!isRecord(data) || data.type !== "canvas-palette-drag-commit") {
    return false;
  }

  if (data.target === null) {
    return true;
  }

  return isCanvasDropTarget(data.target);
}

export function isCanvasDragHandleDownMessage(
  data: unknown,
): data is CanvasDragHandleDownMessage {
  if (!isRecord(data)) {
    return false;
  }

  return (
    data.type === "canvas-drag-handle-down" &&
    typeof data.blockId === "string" &&
    typeof data.clientX === "number" &&
    typeof data.clientY === "number"
  );
}

export function isCanvasDragActiveMessage(
  data: unknown,
): data is CanvasDragActiveMessage {
  if (!isRecord(data)) {
    return false;
  }

  return (
    data.type === "canvas-drag-active" &&
    typeof data.blockId === "string" &&
    isCanvasDragKind(data.dragKind)
  );
}

export function isCanvasDragCommitMessage(
  data: unknown,
): data is CanvasDragCommitMessage {
  if (!isRecord(data)) {
    return false;
  }

  if (data.type !== "canvas-drag-commit" || typeof data.blockId !== "string") {
    return false;
  }

  if (data.target === null) {
    return true;
  }

  return isCanvasDropTarget(data.target);
}

export function isCanvasDragPointerMessage(
  data: unknown,
): data is CanvasDragPointerMessage {
  if (!isRecord(data)) {
    return false;
  }

  return data.type === "canvas-drag-pointer" && typeof data.clientY === "number";
}

export function isHistoryUndoMessage(
  data: unknown,
): data is HistoryUndoMessage {
  return isRecord(data) && data.type === "history-undo";
}

export function isHistoryRedoMessage(
  data: unknown,
): data is HistoryRedoMessage {
  return isRecord(data) && data.type === "history-redo";
}

const BUILDER_SHORTCUT_ACTIONS = [
  "undo",
  "redo",
  "save",
  "preview",
  "delete",
  "deselect",
] as const;

export function isBuilderShortcutMessage(
  data: unknown,
): data is BuilderShortcutMessage {
  if (!isRecord(data) || data.type !== "builder-shortcut") {
    return false;
  }
  return (
    typeof data.action === "string" &&
    (BUILDER_SHORTCUT_ACTIONS as readonly string[]).includes(data.action)
  );
}
