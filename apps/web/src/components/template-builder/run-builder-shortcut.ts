import type { NudgeDirection } from "@repo/shared";
import type { BuilderShortcutAction } from "./builder-shortcut";

export type BuilderShortcutHandlers = {
  canEdit: boolean;
  isSaving: boolean;
  previewOpen: boolean;
  selectedBlockId: string | null;
  undo: () => void;
  redo: () => void;
  save: () => void;
  openPreview: () => void;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  nudgeBlock: (blockId: string, direction: NudgeDirection) => void;
  copyBlockStyle: (blockId: string) => void;
  pasteBlockStyle: (blockId: string) => void;
  openSaveLibrary: () => void;
  selectBlock: (blockId: string | null) => void;
};

export function runBuilderShortcut(
  action: BuilderShortcutAction,
  handlers: BuilderShortcutHandlers,
): void {
  switch (action) {
    case "undo":
      if (handlers.canEdit) {
        handlers.undo();
      }
      return;
    case "redo":
      if (handlers.canEdit) {
        handlers.redo();
      }
      return;
    case "save":
      if (handlers.canEdit && !handlers.isSaving) {
        handlers.save();
      }
      return;
    case "preview":
      handlers.openPreview();
      return;
    case "delete":
      if (handlers.canEdit && handlers.selectedBlockId) {
        handlers.removeBlock(handlers.selectedBlockId);
      }
      return;
    case "duplicate":
      if (handlers.canEdit && handlers.selectedBlockId) {
        handlers.duplicateBlock(handlers.selectedBlockId);
      }
      return;
    case "move-up":
      if (handlers.canEdit && handlers.selectedBlockId) {
        handlers.nudgeBlock(handlers.selectedBlockId, -1);
      }
      return;
    case "move-down":
      if (handlers.canEdit && handlers.selectedBlockId) {
        handlers.nudgeBlock(handlers.selectedBlockId, 1);
      }
      return;
    case "copy-style":
      if (handlers.canEdit && handlers.selectedBlockId) {
        handlers.copyBlockStyle(handlers.selectedBlockId);
      }
      return;
    case "paste-style":
      if (handlers.canEdit && handlers.selectedBlockId) {
        handlers.pasteBlockStyle(handlers.selectedBlockId);
      }
      return;
    case "save-library":
      if (handlers.canEdit) {
        handlers.openSaveLibrary();
      }
      return;
    case "deselect":
      if (!handlers.previewOpen) {
        handlers.selectBlock(null);
      }
      return;
  }
}
