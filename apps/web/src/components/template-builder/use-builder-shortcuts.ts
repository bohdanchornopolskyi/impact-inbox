"use client";

import { useEffect, useRef } from "react";
import { matchBuilderShortcut } from "./builder-shortcut";
import { useBuilderStore, useSaveRevision } from "./builder-provider";
import { runBuilderShortcut } from "./run-builder-shortcut";

export function useBuilderShortcuts() {
  const store = useBuilderStore();
  const { saveRevision, isPending } = useSaveRevision();
  const saveRevisionRef = useRef(saveRevision);
  saveRevisionRef.current = saveRevision;
  const isPendingRef = useRef(isPending);
  isPendingRef.current = isPending;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const action = matchBuilderShortcut(event);
      if (!action) {
        return;
      }
      event.preventDefault();
      const state = store.getState();
      runBuilderShortcut(action, {
        canEdit: state.canEdit,
        isSaving: isPendingRef.current,
        previewOpen: state.previewOpen,
        selectedBlockId: state.selectedBlockId,
        undo: state.undo,
        redo: state.redo,
        save: () => {
          void saveRevisionRef.current();
        },
        openPreview: () => state.setPreviewOpen(true),
        removeBlock: state.removeBlock,
        duplicateBlock: state.duplicateBlock,
        selectBlock: state.selectBlock,
      });
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [store]);
}
