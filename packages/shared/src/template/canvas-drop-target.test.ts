import { describe, expect, it } from "vitest";
import { resolveInsertionIndex } from "./canvas-contract";
import {
  filterDraggedSiblingIds,
  getCanvasDropTargetRuntimeScript,
  isDragKindValidForTargetKind,
  resolveInsertionIndexExcludingSibling,
} from "./canvas-drop-target";

describe("filterDraggedSiblingIds", () => {
  const siblings = [
    { id: "a", start: 0, end: 100 },
    { id: "b", start: 100, end: 200 },
    { id: "c", start: 200, end: 300 },
  ];

  it("returns all siblings when no exclude id", () => {
    expect(filterDraggedSiblingIds(siblings, (s) => s.id, null)).toEqual(siblings);
  });

  it("removes the excluded sibling", () => {
    expect(filterDraggedSiblingIds(siblings, (s) => s.id, "b")).toEqual([
      siblings[0],
      siblings[2],
    ]);
  });
});

describe("resolveInsertionIndexExcludingSibling", () => {
  const siblings = [
    { id: "block-a", start: 0, end: 100 },
    { id: "block-b", start: 100, end: 200 },
    { id: "block-c", start: 200, end: 300 },
  ];

  it("matches layout drag semantics when dragging the first block down", () => {
    expect(resolveInsertionIndexExcludingSibling(225, siblings, "block-a")).toBe(1);
  });

  it("matches layout drag semantics when dragging the last block up", () => {
    expect(resolveInsertionIndexExcludingSibling(25, siblings, "block-c")).toBe(0);
  });

  it("allows append when dragging the last block below itself", () => {
    expect(resolveInsertionIndexExcludingSibling(350, siblings, "block-c")).toBe(2);
  });
});

describe("isDragKindValidForTargetKind", () => {
  it("accepts matching drag kind and target kind pairs", () => {
    expect(
      isDragKindValidForTargetKind("content", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    ).toBe(true);
    expect(isDragKindValidForTargetKind("section", { kind: "body", index: 0 })).toBe(
      true,
    );
    expect(
      isDragKindValidForTargetKind("row", {
        kind: "section",
        sectionId: "section-1",
        index: 0,
      }),
    ).toBe(true);
    expect(
      isDragKindValidForTargetKind("column", {
        kind: "row",
        rowId: "row-1",
        index: 0,
      }),
    ).toBe(true);
  });

  it("rejects mismatched pairs", () => {
    expect(
      isDragKindValidForTargetKind("section", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    ).toBe(false);
    expect(isDragKindValidForTargetKind("content", null)).toBe(false);
  });
});

describe("getCanvasDropTargetRuntimeScript", () => {
  it("embeds the same helper names as the typed API", () => {
    const runtime = getCanvasDropTargetRuntimeScript();

    expect(runtime).toContain("function resolveInsertionIndex");
    expect(runtime).toContain("function filterDraggedSiblingIds");
    expect(runtime).toContain("function resolveInsertionIndexExcludingSibling");
    expect(runtime).toContain("function isDragKindValidForTargetKind");
    expect(runtime).not.toMatch(/require\(/);
    expect(() => {
      new Function(runtime);
    }).not.toThrow();
  });

  it("matches typed insertion-index and kind-validity behavior when evaluated", () => {
    const runtime = getCanvasDropTargetRuntimeScript();
    const embedded = new Function(
      `${runtime}; return {
        resolveInsertionIndex: resolveInsertionIndex,
        resolveInsertionIndexExcludingSibling: resolveInsertionIndexExcludingSibling,
        isDragKindValidForTargetKind: isDragKindValidForTargetKind,
      };`,
    )() as {
      resolveInsertionIndex: typeof resolveInsertionIndex;
      resolveInsertionIndexExcludingSibling: typeof resolveInsertionIndexExcludingSibling;
      isDragKindValidForTargetKind: typeof isDragKindValidForTargetKind;
    };
    const siblings = [
      { id: "block-a", start: 0, end: 100 },
      { id: "block-b", start: 100, end: 200 },
      { id: "block-c", start: 200, end: 300 },
    ];
    const bounds = [
      { start: 0, end: 100 },
      { start: 100, end: 200 },
    ];

    expect(embedded.resolveInsertionIndex(40, bounds)).toBe(
      resolveInsertionIndex(40, bounds),
    );
    expect(embedded.resolveInsertionIndexExcludingSibling(225, siblings, "block-a")).toBe(
      resolveInsertionIndexExcludingSibling(225, siblings, "block-a"),
    );
    expect(
      embedded.isDragKindValidForTargetKind("content", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    ).toBe(
      isDragKindValidForTargetKind("content", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    );
    expect(
      embedded.isDragKindValidForTargetKind("section", { kind: "body", index: 0 }),
    ).toBe(isDragKindValidForTargetKind("section", { kind: "body", index: 0 }));
  });
});
