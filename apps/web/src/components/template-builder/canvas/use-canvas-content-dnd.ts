"use client";

import { useCallback, useRef } from "react";
import type { TemplateContentData } from "@repo/shared";
import {
  canDropContentBlockAtTarget,
  isCanvasDragActiveMessage,
  isCanvasDragCommitMessage,
  isCanvasDragHandleDownMessage,
} from "./canvas-dnd";

type UseCanvasContentDndOptions = {
  canEdit: boolean;
  getContent: () => TemplateContentData;
  moveBlock: (blockId: string, targetColumnId: string, targetIndex: number) => void;
  selectBlock: (blockId: string) => void;
  onPrepareDrag: () => void;
};

export function useCanvasContentDnd({
  canEdit,
  getContent,
  moveBlock,
  selectBlock,
  onPrepareDrag,
}: UseCanvasContentDndOptions) {
  const dragActiveRef = useRef(false);

  const endDrag = useCallback(() => {
    dragActiveRef.current = false;
  }, []);

  const handleDragMessage = useCallback(
    (data: unknown): boolean => {
      if (!canEdit) {
        return false;
      }

      if (isCanvasDragHandleDownMessage(data)) {
        dragActiveRef.current = false;
        return true;
      }

      if (isCanvasDragActiveMessage(data)) {
        onPrepareDrag();
        dragActiveRef.current = true;
        return true;
      }

      if (isCanvasDragCommitMessage(data)) {
        const target = canDropContentBlockAtTarget(
          getContent(),
          data.blockId,
          data.target,
        )
          ? data.target
          : null;

        if (target) {
          moveBlock(data.blockId, target.columnId, target.index);
          selectBlock(data.blockId);
        }

        endDrag();
        return true;
      }

      return false;
    },
    [canEdit, endDrag, getContent, moveBlock, onPrepareDrag, selectBlock],
  );

  return { handleDragMessage };
}
