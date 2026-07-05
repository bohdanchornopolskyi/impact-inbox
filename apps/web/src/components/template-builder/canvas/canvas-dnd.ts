import {
  CONTENT_BLOCK_TYPES,
  findBlock,
  isBodyDropTarget,
  isCanvasDropTarget,
  isColumnDropTarget,
  isContentBlock,
  isDescendantOf,
  isRowDropTarget,
  isSectionDropTarget,
  type CanvasDropTarget,
  type ContentBlockType,
  type TemplateBlockType,
  type TemplateContentData,
} from "@repo/shared";

export const CANVAS_DRAG_KINDS = [
  "content",
  "section",
  "row",
  "column",
] as const;

export type CanvasDragKind = (typeof CANVAS_DRAG_KINDS)[number];

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

function isCanvasDragKind(value: unknown): value is CanvasDragKind {
  return (
    typeof value === "string" &&
    (CANVAS_DRAG_KINDS as readonly string[]).includes(value)
  );
}

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
    isCanvasDragKind(message.dragKind)
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

  return isCanvasDropTarget(message.target);
}

export function inferCanvasDragKind(
  content: TemplateContentData,
  blockId: string,
): CanvasDragKind | null {
  const found = findBlock(content, blockId);
  if (!found) {
    return null;
  }

  if (
    found.block.type === "section" ||
    found.block.type === "row" ||
    found.block.type === "column"
  ) {
    return found.block.type;
  }

  return isContentBlock(found.block) ? "content" : null;
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

export function canDropSectionAtTarget(
  content: TemplateContentData,
  sectionId: string,
  target: CanvasDropTarget | null,
): target is Extract<CanvasDropTarget, { kind: "body" }> {
  if (!isBodyDropTarget(target)) {
    return false;
  }

  const found = findBlock(content, sectionId);
  return found?.block.type === "section";
}

export function canDropRowAtTarget(
  content: TemplateContentData,
  rowId: string,
  target: CanvasDropTarget | null,
): target is Extract<CanvasDropTarget, { kind: "section" }> {
  if (!isSectionDropTarget(target)) {
    return false;
  }

  const found = findBlock(content, rowId);
  if (!found || found.block.type !== "row") {
    return false;
  }

  return !isDescendantOf(content, rowId, target.sectionId);
}

export function canDropColumnAtTarget(
  content: TemplateContentData,
  columnId: string,
  target: CanvasDropTarget | null,
): target is Extract<CanvasDropTarget, { kind: "row" }> {
  if (!isRowDropTarget(target)) {
    return false;
  }

  const found = findBlock(content, columnId);
  if (!found || found.block.type !== "column") {
    return false;
  }

  return !isDescendantOf(content, columnId, target.rowId);
}

export function canDropAtTarget(
  content: TemplateContentData,
  blockId: string,
  dragKind: CanvasDragKind,
  target: CanvasDropTarget | null,
): boolean {
  switch (dragKind) {
    case "content":
      return canDropContentBlockAtTarget(content, blockId, target);
    case "section":
      return canDropSectionAtTarget(content, blockId, target);
    case "row":
      return canDropRowAtTarget(content, blockId, target);
    case "column":
      return canDropColumnAtTarget(content, blockId, target);
    default: {
      const unreachable: never = dragKind;
      return unreachable;
    }
  }
}

const contentBlockTypeSet = new Set<string>(CONTENT_BLOCK_TYPES);

function isContentBlockType(type: TemplateBlockType): type is ContentBlockType {
  return contentBlockTypeSet.has(type);
}

export function blockTypeToDragKind(blockType: TemplateBlockType): CanvasDragKind {
  if (blockType === "section") {
    return "section";
  }
  if (blockType === "row") {
    return "row";
  }
  if (blockType === "column") {
    return "column";
  }
  return "content";
}

export function canInsertAtTarget(
  dragKind: CanvasDragKind,
  target: CanvasDropTarget | null,
): boolean {
  if (!target) {
    return false;
  }

  switch (dragKind) {
    case "content":
      return isColumnDropTarget(target);
    case "section":
      return isBodyDropTarget(target);
    case "row":
      return isSectionDropTarget(target);
    case "column":
      return isRowDropTarget(target);
    default: {
      const unreachable: never = dragKind;
      return unreachable;
    }
  }
}

export function canInsertBlockTypeAtTarget(
  blockType: TemplateBlockType,
  target: CanvasDropTarget | null,
): boolean {
  return canInsertAtTarget(blockTypeToDragKind(blockType), target);
}

type PaletteInsertActions = {
  addSection: (index?: number) => void;
  addRow: (sectionId: string, index?: number) => void;
  addColumn: (rowId: string, index?: number) => void;
  addBlock: (columnId: string, blockType: ContentBlockType, index?: number) => void;
};

export function applyPaletteInsert(
  blockType: TemplateBlockType,
  target: CanvasDropTarget,
  actions: PaletteInsertActions,
): void {
  const dragKind = blockTypeToDragKind(blockType);

  switch (dragKind) {
    case "section":
      if (target.kind === "body") {
        actions.addSection(target.index);
      }
      break;
    case "row":
      if (target.kind === "section") {
        actions.addRow(target.sectionId, target.index);
      }
      break;
    case "column":
      if (target.kind === "row") {
        actions.addColumn(target.rowId, target.index);
      }
      break;
    case "content":
      if (target.kind === "column" && isContentBlockType(blockType)) {
        actions.addBlock(target.columnId, blockType, target.index);
      }
      break;
    default: {
      const unreachable: never = dragKind;
      return unreachable;
    }
  }
}
