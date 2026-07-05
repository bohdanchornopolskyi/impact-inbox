import {
  isColumnDropTarget,
  findBlock,
  isContentBlock,
  type CanvasDropTarget,
  type TemplateContentData,
} from "@repo/shared";

export type CanvasDragHandleDownMessage = {
  type: "canvas-drag-handle-down";
  blockId: string;
  clientX: number;
  clientY: number;
};

export type CanvasDragActiveMessage = {
  type: "canvas-drag-active";
  blockId: string;
  dragKind: "content";
};

export type CanvasDragCommitMessage = {
  type: "canvas-drag-commit";
  blockId: string;
  target: CanvasDropTarget | null;
};

export function isCanvasDragHandleDownMessage(
  data: unknown,
): data is CanvasDragHandleDownMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  return (
    message.type === "canvas-drag-handle-down" &&
    typeof message.blockId === "string" &&
    typeof message.clientX === "number" &&
    typeof message.clientY === "number"
  );
}

export function isCanvasDragActiveMessage(
  data: unknown,
): data is CanvasDragActiveMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  return (
    message.type === "canvas-drag-active" &&
    typeof message.blockId === "string" &&
    message.dragKind === "content"
  );
}

export function isCanvasDragCommitMessage(
  data: unknown,
): data is CanvasDragCommitMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  if (message.type !== "canvas-drag-commit" || typeof message.blockId !== "string") {
    return false;
  }

  if (message.target === null) {
    return true;
  }

  return isColumnDropTarget(message.target as CanvasDropTarget);
}

export function canDropContentBlockAtTarget(
  content: TemplateContentData,
  draggedBlockId: string,
  target: CanvasDropTarget | null,
): target is Extract<CanvasDropTarget, { kind: "column" }> {
  if (!isColumnDropTarget(target)) {
    return false;
  }

  const found = findBlock(content, draggedBlockId);
  if (!found || !isContentBlock(found.block)) {
    return false;
  }

  return true;
}
