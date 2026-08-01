import { describe, expect, it, vi } from "vitest";
import {
  runBuilderShortcut,
  type BuilderShortcutHandlers,
} from "./run-builder-shortcut";

function handlers(
  overrides: Partial<BuilderShortcutHandlers> = {},
): BuilderShortcutHandlers {
  return {
    canEdit: true,
    isSaving: false,
    previewOpen: false,
    selectedBlockId: null,
    undo: vi.fn(),
    redo: vi.fn(),
    save: vi.fn(),
    openPreview: vi.fn(),
    removeBlock: vi.fn(),
    duplicateBlock: vi.fn(),
    selectBlock: vi.fn(),
    ...overrides,
  };
}

describe("runBuilderShortcut", () => {
  it("saves only when editable and not already saving", () => {
    const save = vi.fn();
    runBuilderShortcut("save", handlers({ save }));
    expect(save).toHaveBeenCalledTimes(1);

    runBuilderShortcut("save", handlers({ save, isSaving: true }));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("deletes the selected block", () => {
    const removeBlock = vi.fn();
    runBuilderShortcut(
      "delete",
      handlers({ removeBlock, selectedBlockId: "block-1" }),
    );
    expect(removeBlock).toHaveBeenCalledWith("block-1");
  });

  it("duplicates the selected block only when editable", () => {
    const duplicateBlock = vi.fn();
    runBuilderShortcut(
      "duplicate",
      handlers({ duplicateBlock, selectedBlockId: "block-1" }),
    );
    expect(duplicateBlock).toHaveBeenCalledWith("block-1");

    runBuilderShortcut(
      "duplicate",
      handlers({ duplicateBlock, selectedBlockId: "block-1", canEdit: false }),
    );
    expect(duplicateBlock).toHaveBeenCalledTimes(1);

    runBuilderShortcut("duplicate", handlers({ duplicateBlock }));
    expect(duplicateBlock).toHaveBeenCalledTimes(1);
  });
});
