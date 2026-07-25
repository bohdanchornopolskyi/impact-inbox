import { describe, expect, it, vi } from "vitest";
import { runBuilderShortcut } from "./run-builder-shortcut";

describe("runBuilderShortcut", () => {
  it("saves only when editable and not already saving", () => {
    const save = vi.fn();
    runBuilderShortcut("save", {
      canEdit: true,
      isSaving: false,
      previewOpen: false,
      selectedBlockId: null,
      undo: vi.fn(),
      redo: vi.fn(),
      save,
      openPreview: vi.fn(),
      removeBlock: vi.fn(),
      selectBlock: vi.fn(),
    });
    expect(save).toHaveBeenCalledTimes(1);

    runBuilderShortcut("save", {
      canEdit: true,
      isSaving: true,
      previewOpen: false,
      selectedBlockId: null,
      undo: vi.fn(),
      redo: vi.fn(),
      save,
      openPreview: vi.fn(),
      removeBlock: vi.fn(),
      selectBlock: vi.fn(),
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("deletes the selected block", () => {
    const removeBlock = vi.fn();
    runBuilderShortcut("delete", {
      canEdit: true,
      isSaving: false,
      previewOpen: false,
      selectedBlockId: "block-1",
      undo: vi.fn(),
      redo: vi.fn(),
      save: vi.fn(),
      openPreview: vi.fn(),
      removeBlock,
      selectBlock: vi.fn(),
    });
    expect(removeBlock).toHaveBeenCalledWith("block-1");
  });
});
