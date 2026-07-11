import type { CanvasDropTarget, TemplateContentData } from "@repo/shared";
import type { ContentBlockType, TemplateBlockType } from "@repo/shared";
import {
  isCanvasDragActiveMessage,
  isCanvasDragCommitMessage,
  isCanvasDragHandleDownMessage,
  isCanvasPaletteDragCommitMessage,
  type CanvasDragKind,
} from "./canvas-bridge-protocol";
import {
  applyPaletteInsert,
  canDropAtTarget,
  canInsertBlockTypeAtTarget,
  inferCanvasDragKind,
} from "./canvas-dnd";

export type PaletteDragSession = {
  blockType: TemplateBlockType;
  dragKind: CanvasDragKind;
  pointerId: number;
  startX: number;
  startY: number;
  active: boolean;
};

export type CanvasDragSessionState = {
  paletteSession: PaletteDragSession | null;
  canvasDragKind: CanvasDragKind | null;
  dropTarget: CanvasDropTarget | null;
  paletteFinishHandled: boolean;
};

export function createCanvasDragSessionState(): CanvasDragSessionState {
  return {
    paletteSession: null,
    canvasDragKind: null,
    dropTarget: null,
    paletteFinishHandled: false,
  };
}

export function isDragSessionActive(state: CanvasDragSessionState): boolean {
  return state.paletteSession?.active === true || state.canvasDragKind !== null;
}

export function setDropTarget(
  state: CanvasDragSessionState,
  target: CanvasDropTarget | null,
): void {
  if (!isDragSessionActive(state)) {
    return;
  }
  state.dropTarget = target;
}

export function resetDragSession(state: CanvasDragSessionState): void {
  state.paletteSession = null;
  state.canvasDragKind = null;
  state.dropTarget = null;
  state.paletteFinishHandled = false;
}

type CanvasMoveActions = {
  moveBlock: (blockId: string, targetColumnId: string, targetIndex: number) => boolean;
  moveSection: (sectionId: string, targetIndex: number) => boolean;
  moveRow: (rowId: string, targetSectionId: string, targetIndex: number) => boolean;
  moveColumn: (columnId: string, targetRowId: string, targetIndex: number) => boolean;
  selectBlock: (blockId: string) => void;
};

export function applyCanvasDrop(
  blockId: string,
  dragKind: CanvasDragKind,
  target: CanvasDropTarget,
  actions: CanvasMoveActions,
): boolean {
  let changed = false;

  switch (dragKind) {
    case "content":
      if (target.kind === "column") {
        changed = actions.moveBlock(blockId, target.columnId, target.index);
      }
      break;
    case "section":
      if (target.kind === "body") {
        changed = actions.moveSection(blockId, target.index);
      }
      break;
    case "row":
      if (target.kind === "section") {
        changed = actions.moveRow(blockId, target.sectionId, target.index);
      }
      break;
    case "column":
      if (target.kind === "row") {
        changed = actions.moveColumn(blockId, target.rowId, target.index);
      }
      break;
    default: {
      const unreachable: never = dragKind;
      return unreachable;
    }
  }

  if (changed) {
    actions.selectBlock(blockId);
  }

  return changed;
}

type PaletteInsertActions = {
  addSection: (index?: number) => void;
  addRow: (sectionId: string, index?: number) => void;
  addColumn: (rowId: string, index?: number) => void;
  addBlock: (columnId: string, blockType: ContentBlockType, index?: number) => void;
};

export function commitPaletteDrop(
  state: CanvasDragSessionState,
  target: CanvasDropTarget | null,
  actions: PaletteInsertActions,
): boolean {
  if (state.paletteFinishHandled) {
    return false;
  }
  state.paletteFinishHandled = true;

  const session = state.paletteSession;
  if (
    !session?.active ||
    !target ||
    !canInsertBlockTypeAtTarget(session.blockType, target)
  ) {
    return false;
  }

  applyPaletteInsert(session.blockType, target, actions);
  return true;
}

export type HandleCanvasDragMessageInput = {
  state: CanvasDragSessionState;
  data: unknown;
  canEdit: boolean;
  content: TemplateContentData;
  moveActions: CanvasMoveActions;
  paletteActions: PaletteInsertActions;
};

export type HandleCanvasDragMessageResult = {
  handled: boolean;
  canvasDragStarted: boolean;
  canvasDragEnded: boolean;
  dropCommitted: boolean;
};

export function handleCanvasDragMessage(
  input: HandleCanvasDragMessageInput,
): HandleCanvasDragMessageResult {
  const result: HandleCanvasDragMessageResult = {
    handled: false,
    canvasDragStarted: false,
    canvasDragEnded: false,
    dropCommitted: false,
  };

  if (!input.canEdit) {
    return result;
  }

  const { state, data, content, moveActions } = input;

  if (isCanvasDragHandleDownMessage(data)) {
    state.canvasDragKind = null;
    result.handled = true;
    return result;
  }

  if (isCanvasDragActiveMessage(data)) {
    state.canvasDragKind = data.dragKind;
    result.handled = true;
    result.canvasDragStarted = true;
    return result;
  }

  if (isCanvasDragCommitMessage(data)) {
    result.handled = true;
    result.canvasDragEnded = true;

    const dragKind =
      state.canvasDragKind ?? inferCanvasDragKind(content, data.blockId);
    if (dragKind) {
      const target = canDropAtTarget(content, data.blockId, dragKind, data.target)
        ? data.target
        : null;

      if (target && applyCanvasDrop(data.blockId, dragKind, target, moveActions)) {
        result.dropCommitted = true;
      }
    }

    state.canvasDragKind = null;
    state.dropTarget = null;
    return result;
  }

  if (isCanvasPaletteDragCommitMessage(data)) {
    result.handled = true;
    if (commitPaletteDrop(state, data.target, input.paletteActions)) {
      result.dropCommitted = true;
    }
    resetDragSession(state);
    return result;
  }

  return result;
}
