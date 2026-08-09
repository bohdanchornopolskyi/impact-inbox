import { describe, expect, it } from "vitest";
import { resolveInsertionIndex } from "./canvas-contract";
import {
  distanceToRect,
  filterDraggedSiblingIds,
  getCanvasDropTargetRuntimeScript,
  isDragKindValidForTargetKind,
  nearestRectIndex,
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

describe("nearestRectIndex", () => {
  // One section spanning the top of a taller canvas, as in the builder.
  const firstColumn = { left: 50, top: 0, right: 550, bottom: 100 };
  const secondColumn = { left: 50, top: 100, right: 550, bottom: 200 };
  const columns = [firstColumn, secondColumn];

  it("picks the last column when the pointer is in the empty canvas below it", () => {
    expect(nearestRectIndex(columns, 300, 800)).toBe(1);
  });

  it("picks the first column when the pointer is above the content", () => {
    expect(nearestRectIndex(columns, 300, -400)).toBe(0);
  });

  it("picks the column the pointer is inside", () => {
    expect(nearestRectIndex(columns, 300, 50)).toBe(0);
    expect(nearestRectIndex(columns, 300, 150)).toBe(1);
  });

  it("prefers vertical closeness over horizontal when beside the canvas", () => {
    expect(nearestRectIndex(columns, 2000, 110)).toBe(1);
  });

  it("returns -1 when there is nothing to drop into", () => {
    expect(nearestRectIndex([], 300, 800)).toBe(-1);
  });

  it("ignores collapsed rects", () => {
    const collapsed = { left: 0, top: 0, right: 0, bottom: 0 };

    expect(nearestRectIndex([collapsed], 10, 10)).toBe(-1);
    expect(nearestRectIndex([collapsed, firstColumn], 300, 50)).toBe(1);
  });
});

describe("distanceToRect", () => {
  const rect = { left: 0, top: 0, right: 100, bottom: 100 };

  it("is zero inside the rect", () => {
    expect(distanceToRect(rect, 50, 50)).toBe(0);
  });

  it("measures the gap to the nearest edge", () => {
    expect(distanceToRect(rect, 50, 130)).toBe(30);
    expect(distanceToRect(rect, -20, 50)).toBe(20);
  });

  it("measures diagonally past a corner", () => {
    expect(distanceToRect(rect, 103, 104)).toBeCloseTo(5);
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
    expect(runtime).toContain("function distanceToRect");
    expect(runtime).toContain("function nearestRectIndex");
    expect(runtime).toContain("function nearestElement");
    expect(runtime).not.toMatch(/require\(/);
    expect(() => {
      new Function(runtime);
    }).not.toThrow();
  });

  it("nearestElement returns the element whose rect is closest", () => {
    const runtime = getCanvasDropTargetRuntimeScript();
    const embedded = new Function(
      `${runtime}; return { nearestElement: nearestElement };`,
    )() as {
      nearestElement: <T>(elements: T[], x: number, y: number) => T | null;
    };
    const asElement = (rect: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    }) => ({ getBoundingClientRect: () => rect });
    const top = asElement({ left: 50, top: 0, right: 550, bottom: 100 });
    const bottom = asElement({ left: 50, top: 100, right: 550, bottom: 200 });

    // The reported bug: pointer in the empty canvas below the last column.
    expect(embedded.nearestElement([top, bottom], 300, 800)).toBe(bottom);
    expect(embedded.nearestElement([top, bottom], 300, 40)).toBe(top);
    expect(embedded.nearestElement([], 300, 800)).toBe(null);
  });

  it("matches typed insertion-index and kind-validity behavior when evaluated", () => {
    const runtime = getCanvasDropTargetRuntimeScript();
    const embedded = new Function(
      `${runtime}; return {
        resolveInsertionIndex: resolveInsertionIndex,
        resolveInsertionIndexExcludingSibling: resolveInsertionIndexExcludingSibling,
        isDragKindValidForTargetKind: isDragKindValidForTargetKind,
        nearestRectIndex: nearestRectIndex,
      };`,
    )() as {
      resolveInsertionIndex: typeof resolveInsertionIndex;
      resolveInsertionIndexExcludingSibling: typeof resolveInsertionIndexExcludingSibling;
      isDragKindValidForTargetKind: typeof isDragKindValidForTargetKind;
      nearestRectIndex: typeof nearestRectIndex;
    };
    const columns = [
      { left: 50, top: 0, right: 550, bottom: 100 },
      { left: 50, top: 100, right: 550, bottom: 200 },
    ];

    expect(embedded.nearestRectIndex(columns, 300, 800)).toBe(
      nearestRectIndex(columns, 300, 800),
    );
    expect(embedded.nearestRectIndex([], 300, 800)).toBe(
      nearestRectIndex([], 300, 800),
    );
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
