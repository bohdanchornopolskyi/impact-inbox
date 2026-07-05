import { describe, expect, it, vi } from "vitest";
import { createEmptyTemplateContent } from "@repo/shared";
import {
  applyCanvasDrop,
  commitPaletteDrop,
  createCanvasDragSessionState,
  handleCanvasDragMessage,
  isDragSessionActive,
  resetDragSession,
  setDropTarget,
} from "./canvas-drag-session";

describe("canvas-drag-session", () => {
  it("tracks drop targets only during active drag sessions", () => {
    const state = createCanvasDragSessionState();
    setDropTarget(state, { kind: "body", index: 0 });
    expect(state.dropTarget).toBeNull();

    state.canvasDragKind = "section";
    setDropTarget(state, { kind: "body", index: 1 });
    expect(state.dropTarget).toEqual({ kind: "body", index: 1 });
  });

  it("commits canvas drags only when the move changes the tree", () => {
    const content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    const state = createCanvasDragSessionState();
    state.canvasDragKind = "section";

    const moveSection = vi.fn(() => false);
    const result = handleCanvasDragMessage({
      state,
      data: {
        type: "canvas-drag-commit",
        blockId: sectionId,
        target: { kind: "body", index: 0 },
      },
      canEdit: true,
      content,
      moveActions: {
        moveBlock: vi.fn(),
        moveSection,
        moveRow: vi.fn(),
        moveColumn: vi.fn(),
        selectBlock: vi.fn(),
      },
      paletteActions: {
        addSection: vi.fn(),
        addRow: vi.fn(),
        addColumn: vi.fn(),
        addBlock: vi.fn(),
      },
    });

    expect(result.handled).toBe(true);
    expect(result.dropCommitted).toBe(false);
    expect(moveSection).toHaveBeenCalledWith(sectionId, 0);
    expect(state.canvasDragKind).toBeNull();
    expect(isDragSessionActive(state)).toBe(false);
  });

  it("commits palette drops from iframe messages and clears session state", () => {
    const state = createCanvasDragSessionState();
    state.paletteSession = {
      blockType: "heading",
      dragKind: "content",
      pointerId: 1,
      startX: 0,
      startY: 0,
      active: true,
    };
    const columnId = createEmptyTemplateContent().body[0]!.children[0]!.children[0]!.id;
    const addBlock = vi.fn();

    const result = handleCanvasDragMessage({
      state,
      data: {
        type: "canvas-palette-drag-commit",
        target: { kind: "column", columnId, index: 0 },
      },
      canEdit: true,
      content: createEmptyTemplateContent(),
      moveActions: {
        moveBlock: vi.fn(),
        moveSection: vi.fn(),
        moveRow: vi.fn(),
        moveColumn: vi.fn(),
        selectBlock: vi.fn(),
      },
      paletteActions: {
        addSection: vi.fn(),
        addRow: vi.fn(),
        addColumn: vi.fn(),
        addBlock,
      },
    });

    expect(result.handled).toBe(true);
    expect(result.dropCommitted).toBe(true);
    expect(addBlock).toHaveBeenCalledWith(columnId, "heading", 0);
    expect(state.paletteSession).toBeNull();
    expect(state.dropTarget).toBeNull();
  });

  it("dedupes palette commits after finish is handled", () => {
    const state = createCanvasDragSessionState();
    state.paletteSession = {
      blockType: "heading",
      dragKind: "content",
      pointerId: 1,
      startX: 0,
      startY: 0,
      active: true,
    };
    const addBlock = vi.fn();
    const columnId = createEmptyTemplateContent().body[0]!.children[0]!.children[0]!.id;

    expect(
      commitPaletteDrop(state, { kind: "column", columnId, index: 0 }, {
        addSection: vi.fn(),
        addRow: vi.fn(),
        addColumn: vi.fn(),
        addBlock,
      }),
    ).toBe(true);
    expect(
      commitPaletteDrop(state, { kind: "column", columnId, index: 0 }, {
        addSection: vi.fn(),
        addRow: vi.fn(),
        addColumn: vi.fn(),
        addBlock,
      }),
    ).toBe(false);
    expect(addBlock).toHaveBeenCalledTimes(1);
  });

  it("selects moved blocks only when applyCanvasDrop reports a change", () => {
    const selectBlock = vi.fn();
    applyCanvasDrop(
      "block-1",
      "content",
      { kind: "column", columnId: "col-1", index: 0 },
      {
        moveBlock: () => true,
        moveSection: vi.fn(),
        moveRow: vi.fn(),
        moveColumn: vi.fn(),
        selectBlock,
      },
    );

    expect(selectBlock).toHaveBeenCalledWith("block-1");

    selectBlock.mockClear();
    applyCanvasDrop(
      "block-1",
      "content",
      { kind: "column", columnId: "col-1", index: 0 },
      {
        moveBlock: () => false,
        moveSection: vi.fn(),
        moveRow: vi.fn(),
        moveColumn: vi.fn(),
        selectBlock,
      },
    );

    expect(selectBlock).not.toHaveBeenCalled();
  });

  it("resets all drag session fields", () => {
    const state = createCanvasDragSessionState();
    state.paletteSession = {
      blockType: "text",
      dragKind: "content",
      pointerId: 1,
      startX: 0,
      startY: 0,
      active: true,
    };
    state.canvasDragKind = "row";
    state.dropTarget = { kind: "body", index: 1 };
    state.paletteFinishHandled = true;

    resetDragSession(state);

    expect(state).toEqual(createCanvasDragSessionState());
  });
});
