import { describe, expect, it } from "vitest";
import {
  CANVAS_BLOCK_TYPE_ATTR,
  CANVAS_LAYOUT_ROLE_ATTR,
  CANVAS_PLAIN_TEXT_EDITABLE_TYPES,
  CANVAS_RICHTEXT_EDITABLE_TYPES,
  canvasDropTargetsEqual,
  getCanvasEditableKind,
  isCanvasEditableBlockType,
  resolveInsertionIndex,
} from "./canvas-contract";

describe("canvas-contract", () => {
  it("maps editable block types by discriminator", () => {
    expect(getCanvasEditableKind("heading")).toBe("plain");
    expect(getCanvasEditableKind("text")).toBe("plain");
    expect(getCanvasEditableKind("richtext")).toBe("richtext");
    expect(getCanvasEditableKind("button")).toBeNull();
    expect(isCanvasEditableBlockType("heading")).toBe(true);
    expect(isCanvasEditableBlockType("html")).toBe(false);
  });

  it("exports stable attribute names", () => {
    expect(CANVAS_BLOCK_TYPE_ATTR).toBe("data-block-type");
    expect(CANVAS_LAYOUT_ROLE_ATTR).toBe("data-layout-role");
    expect(CANVAS_PLAIN_TEXT_EDITABLE_TYPES).toEqual(["heading", "text"]);
    expect(CANVAS_RICHTEXT_EDITABLE_TYPES).toEqual(["richtext"]);
  });

  it("resolves insertion index from sibling midpoints", () => {
    const bounds = [
      { start: 0, end: 100 },
      { start: 100, end: 200 },
    ];

    expect(resolveInsertionIndex(40, bounds)).toBe(0);
    expect(resolveInsertionIndex(120, bounds)).toBe(1);
    expect(resolveInsertionIndex(250, bounds)).toBe(2);
  });

  it("compares canvas drop targets structurally", () => {
    expect(
      canvasDropTargetsEqual(
        { kind: "column", columnId: "col-1", index: 0 },
        { kind: "column", columnId: "col-1", index: 0 },
      ),
    ).toBe(true);
    expect(
      canvasDropTargetsEqual(
        { kind: "column", columnId: "col-1", index: 0 },
        { kind: "column", columnId: "col-1", index: 1 },
      ),
    ).toBe(false);
    expect(canvasDropTargetsEqual(null, null)).toBe(true);
  });
});
