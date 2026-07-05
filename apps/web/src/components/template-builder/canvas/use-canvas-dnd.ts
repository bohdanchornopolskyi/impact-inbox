"use client";

import { useCallback, useRef } from "react";
import type { CanvasDropTarget, TemplateContentData } from "@repo/shared";
import {
  canDropAtTarget,
  inferCanvasDragKind,
  isCanvasDragActiveMessage,
  isCanvasDragCommitMessage,
  isCanvasDragHandleDownMessage,
  type CanvasDragKind,
} from "./canvas-dnd";

type UseCanvasDndOptions = {
  canEdit: boolean;
  getContent: () => TemplateContentData;
  moveBlock: (blockId: string, targetColumnId: string, targetIndex: number) => boolean;
  moveSection: (sectionId: string, targetIndex: number) => boolean;
  moveRow: (rowId: string, targetSectionId: string, targetIndex: number) => boolean;
  moveColumn: (columnId: string, targetRowId: string, targetIndex: number) => boolean;
  selectBlock: (blockId: string) => void;
  onPrepareDrag: () => void;
  onDropCommitted: () => void;
};

function applyDrop(
  blockId: string,
  dragKind: CanvasDragKind,
  target: CanvasDropTarget,
  actions: Pick<
    UseCanvasDndOptions,
    "moveBlock" | "moveSection" | "moveRow" | "moveColumn" | "selectBlock"
  >,
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

export function useCanvasDnd({
  canEdit,
  getContent,
  moveBlock,
  moveSection,
  moveRow,
  moveColumn,
  selectBlock,
  onPrepareDrag,
  onDropCommitted,
}: UseCanvasDndOptions) {
  const dragKindRef = useRef<CanvasDragKind | null>(null);

  const endDrag = useCallback(() => {
    dragKindRef.current = null;
  }, []);

  const handleDragMessage = useCallback(
    (data: unknown): boolean => {
      if (!canEdit) {
        return false;
      }

      if (isCanvasDragHandleDownMessage(data)) {
        dragKindRef.current = null;
        return true;
      }

      if (isCanvasDragActiveMessage(data)) {
        onPrepareDrag();
        dragKindRef.current = data.dragKind;
        return true;
      }

      if (isCanvasDragCommitMessage(data)) {
        const content = getContent();
        const dragKind =
          dragKindRef.current ?? inferCanvasDragKind(content, data.blockId);
        if (dragKind) {
          const target = canDropAtTarget(content, data.blockId, dragKind, data.target)
            ? data.target
            : null;

          if (target) {
            const changed = applyDrop(data.blockId, dragKind, target, {
              moveBlock,
              moveSection,
              moveRow,
              moveColumn,
              selectBlock,
            });
            if (changed) {
              onDropCommitted();
            }
          }
        }

        endDrag();
        return true;
      }

      return false;
    },
    [
      canEdit,
      endDrag,
      getContent,
      moveBlock,
      moveColumn,
      moveRow,
      moveSection,
      onDropCommitted,
      onPrepareDrag,
      selectBlock,
    ],
  );

  return { handleDragMessage };
}
