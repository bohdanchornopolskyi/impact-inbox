import {
  CONTENT_BLOCK_TYPES,
  findBlock,
  isBodyDropTarget,
  isColumnDropTarget,
  isContentBlock,
  isDescendantOf,
  isDragKindValidForTargetKind,
  isRowDropTarget,
  isSectionDropTarget,
  type CanvasDropTarget,
  type ContentBlockType,
  type TemplateBlockType,
  type TemplateContentData,
} from "@repo/shared";
import {
  CANVAS_DRAG_KINDS,
  type CanvasDragKind,
} from "./canvas-bridge-protocol";

export { CANVAS_DRAG_KINDS, type CanvasDragKind };

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
  return isDragKindValidForTargetKind(dragKind, target);
}

export function canInsertBlockTypeAtTarget(
  blockType: TemplateBlockType,
  target: CanvasDropTarget | null,
): boolean {
  return canInsertAtTarget(blockTypeToDragKind(blockType), target);
}

export function canShowDropIndicator(
  dragKind: CanvasDragKind,
  target: CanvasDropTarget | null,
  content: TemplateContentData,
  draggedBlockId: string | null,
): boolean {
  if (!target) {
    return false;
  }

  if (!draggedBlockId) {
    return canInsertAtTarget(dragKind, target);
  }

  return canDropAtTarget(content, draggedBlockId, dragKind, target);
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
