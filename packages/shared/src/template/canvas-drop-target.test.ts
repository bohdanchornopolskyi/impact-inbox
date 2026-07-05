import { describe, expect, it } from "vitest";
import {
  filterDraggedSiblingIds,
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
