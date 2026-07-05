import { describe, expect, it, vi } from "vitest";
import type { TemplateContentData } from "@repo/shared";
import {
  applyPaletteInsert,
  blockTypeToDragKind,
  canDropAtTarget,
  canDropColumnAtTarget,
  canDropContentBlockAtTarget,
  canDropRowAtTarget,
  canDropSectionAtTarget,
  canInsertAtTarget,
  canInsertBlockTypeAtTarget,
  inferCanvasDragKind,
  isCanvasDragActiveMessage,
  isCanvasDragCommitMessage,
  isCanvasDragHandleDownMessage,
} from "./canvas-dnd";

const content: TemplateContentData = {
  version: 1,
  settings: { width: 600 },
  body: [
    {
      id: "section-1",
      type: "section",
      props: {},
      children: [
        {
          id: "row-1",
          type: "row",
          props: {},
          children: [
            {
              id: "col-1",
              type: "column",
              props: {},
              children: [
                {
                  id: "heading-1",
                  type: "heading",
                  props: { text: "Hello", level: 1 },
                },
              ],
            },
            {
              id: "col-2",
              type: "column",
              props: {},
              children: [],
            },
          ],
        },
        {
          id: "row-2",
          type: "row",
          props: {},
          children: [
            {
              id: "col-3",
              type: "column",
              props: {},
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "section-2",
      type: "section",
      props: {},
      children: [
        {
          id: "row-3",
          type: "row",
          props: {},
          children: [
            {
              id: "col-4",
              type: "column",
              props: {},
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

describe("isCanvasDragHandleDownMessage", () => {
  it("accepts drag-handle pointer down messages", () => {
    expect(
      isCanvasDragHandleDownMessage({
        type: "canvas-drag-handle-down",
        blockId: "heading-1",
        clientX: 10,
        clientY: 20,
      }),
    ).toBe(true);
  });
});

describe("isCanvasDragActiveMessage", () => {
  it("accepts all drag kinds", () => {
    for (const dragKind of ["content", "section", "row", "column"] as const) {
      expect(
        isCanvasDragActiveMessage({
          type: "canvas-drag-active",
          blockId: "block-1",
          dragKind,
        }),
      ).toBe(true);
    }
  });
});

describe("isCanvasDragCommitMessage", () => {
  it("accepts commit messages with any valid drop target", () => {
    expect(
      isCanvasDragCommitMessage({
        type: "canvas-drag-commit",
        blockId: "heading-1",
        target: { kind: "column", columnId: "col-2", index: 0 },
      }),
    ).toBe(true);
    expect(
      isCanvasDragCommitMessage({
        type: "canvas-drag-commit",
        blockId: "section-1",
        target: { kind: "body", index: 1 },
      }),
    ).toBe(true);
    expect(
      isCanvasDragCommitMessage({
        type: "canvas-drag-commit",
        blockId: "row-1",
        target: { kind: "section", sectionId: "section-2", index: 0 },
      }),
    ).toBe(true);
    expect(
      isCanvasDragCommitMessage({
        type: "canvas-drag-commit",
        blockId: "col-1",
        target: { kind: "row", rowId: "row-2", index: 0 },
      }),
    ).toBe(true);
    expect(
      isCanvasDragCommitMessage({
        type: "canvas-drag-commit",
        blockId: "heading-1",
        target: null,
      }),
    ).toBe(true);
  });
});

describe("canDropContentBlockAtTarget", () => {
  it("accepts column targets for content blocks", () => {
    expect(
      canDropContentBlockAtTarget(content, "heading-1", {
        kind: "column",
        columnId: "col-2",
        index: 0,
      }),
    ).toBe(true);
  });

  it("rejects non-column targets and layout blocks", () => {
    expect(
      canDropContentBlockAtTarget(content, "heading-1", {
        kind: "body",
        index: 0,
      }),
    ).toBe(false);
    expect(
      canDropContentBlockAtTarget(content, "section-1", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    ).toBe(false);
  });
});

describe("canDropSectionAtTarget", () => {
  it("accepts body targets for sections", () => {
    expect(
      canDropSectionAtTarget(content, "section-1", { kind: "body", index: 0 }),
    ).toBe(true);
  });

  it("rejects non-body targets", () => {
    expect(
      canDropSectionAtTarget(content, "section-1", {
        kind: "section",
        sectionId: "section-2",
        index: 0,
      }),
    ).toBe(false);
  });
});

describe("canDropRowAtTarget", () => {
  it("accepts section targets for rows", () => {
    expect(
      canDropRowAtTarget(content, "row-1", {
        kind: "section",
        sectionId: "section-2",
        index: 0,
      }),
    ).toBe(true);
  });

  it("rejects non-section targets", () => {
    expect(
      canDropRowAtTarget(content, "row-1", {
        kind: "row",
        rowId: "row-2",
        index: 0,
      }),
    ).toBe(false);
  });
});

describe("canDropColumnAtTarget", () => {
  it("accepts row targets for columns", () => {
    expect(
      canDropColumnAtTarget(content, "col-1", {
        kind: "row",
        rowId: "row-2",
        index: 0,
      }),
    ).toBe(true);
  });

  it("rejects non-row targets", () => {
    expect(
      canDropColumnAtTarget(content, "col-1", {
        kind: "column",
        columnId: "col-2",
        index: 0,
      }),
    ).toBe(false);
  });
});

describe("inferCanvasDragKind", () => {
  it("maps block types to drag kinds", () => {
    expect(inferCanvasDragKind(content, "heading-1")).toBe("content");
    expect(inferCanvasDragKind(content, "section-1")).toBe("section");
    expect(inferCanvasDragKind(content, "row-1")).toBe("row");
    expect(inferCanvasDragKind(content, "col-1")).toBe("column");
    expect(inferCanvasDragKind(content, "missing")).toBeNull();
  });
});

describe("canDropAtTarget", () => {
  it("dispatches validation by drag kind", () => {
    expect(
      canDropAtTarget(content, "heading-1", "content", {
        kind: "column",
        columnId: "col-2",
        index: 0,
      }),
    ).toBe(true);
    expect(
      canDropAtTarget(content, "section-1", "section", { kind: "body", index: 1 }),
    ).toBe(true);
    expect(
      canDropAtTarget(content, "row-1", "row", {
        kind: "section",
        sectionId: "section-2",
        index: 0,
      }),
    ).toBe(true);
    expect(
      canDropAtTarget(content, "col-1", "column", {
        kind: "row",
        rowId: "row-2",
        index: 0,
      }),
    ).toBe(true);
  });

  it("rejects mismatched drag kind and target", () => {
    expect(
      canDropAtTarget(content, "section-1", "section", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    ).toBe(false);
  });
});

describe("blockTypeToDragKind", () => {
  it("maps layout and content block types", () => {
    expect(blockTypeToDragKind("section")).toBe("section");
    expect(blockTypeToDragKind("row")).toBe("row");
    expect(blockTypeToDragKind("column")).toBe("column");
    expect(blockTypeToDragKind("heading")).toBe("content");
  });
});

describe("canInsertAtTarget", () => {
  it("accepts valid palette insert targets", () => {
    expect(canInsertAtTarget("section", { kind: "body", index: 0 })).toBe(true);
    expect(
      canInsertAtTarget("row", {
        kind: "section",
        sectionId: "section-1",
        index: 0,
      }),
    ).toBe(true);
    expect(
      canInsertAtTarget("column", { kind: "row", rowId: "row-1", index: 0 }),
    ).toBe(true);
    expect(
      canInsertAtTarget("content", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    ).toBe(true);
  });

  it("rejects mismatched insert targets", () => {
    expect(
      canInsertAtTarget("section", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    ).toBe(false);
    expect(
      canInsertBlockTypeAtTarget("heading", { kind: "body", index: 0 }),
    ).toBe(false);
  });
});

describe("applyPaletteInsert", () => {
  it("calls the matching insert action for valid targets", () => {
    const addSection = vi.fn();
    const addRow = vi.fn();
    const addColumn = vi.fn();
    const addBlock = vi.fn();

    applyPaletteInsert(
      "section",
      { kind: "body", index: 1 },
      { addSection, addRow, addColumn, addBlock },
    );
    expect(addSection).toHaveBeenCalledWith(1);

    applyPaletteInsert(
      "row",
      { kind: "section", sectionId: "section-1", index: 0 },
      { addSection, addRow, addColumn, addBlock },
    );
    expect(addRow).toHaveBeenCalledWith("section-1", 0);

    applyPaletteInsert(
      "column",
      { kind: "row", rowId: "row-1", index: 2 },
      { addSection, addRow, addColumn, addBlock },
    );
    expect(addColumn).toHaveBeenCalledWith("row-1", 2);

    applyPaletteInsert(
      "heading",
      { kind: "column", columnId: "col-1", index: 0 },
      { addSection, addRow, addColumn, addBlock },
    );
    expect(addBlock).toHaveBeenCalledWith("col-1", "heading", 0);
  });
});
