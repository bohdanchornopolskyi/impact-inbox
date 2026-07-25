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
    case "deselect":
      if (!handlers.previewOpen) {
        handlers.selectBlock(null);
      }
      return;
  }
}
