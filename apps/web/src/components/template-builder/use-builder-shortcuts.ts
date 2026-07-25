"use client";

import { useEffect, useRef } from "react";
import { matchBuilderShortcut } from "./builder-shortcut";
import { useBuilder, useSaveRevision } from "./builder-provider";
import { runBuilderShortcut } from "./run-builder-shortcut";

export function useBuilderShortcuts() {
  const canEdit = useBuilder((s) => s.canEdit);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const removeBlock = useBuilder((s) => s.removeBlock);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const setPreviewOpen = useBuilder((s) => s.setPreviewOpen);
  const previewOpen = useBuilder((s) => s.previewOpen);
  const { saveRevision, isPending } = useSaveRevision();

  const handlersRef = useRef({
    canEdit,
    isSaving: isPending,
    previewOpen,
    selectedBlockId,
    undo,
    redo,
    save: () => {
      void saveRevision();
    },
    openPreview: () => setPreviewOpen(true),
    removeBlock,
    selectBlock,
  });

  handlersRef.current = {
    canEdit,
    isSaving: isPending,
    previewOpen,
    selectedBlockId,
    undo,
    redo,
    save: () => {
      void saveRevision();
    },
    openPreview: () => setPreviewOpen(true),
    removeBlock,
    selectBlock,
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const action = matchBuilderShortcut(event);
      if (!action) {
        return;
      }
      event.preventDefault();
      runBuilderShortcut(action, handlersRef.current);
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
}
