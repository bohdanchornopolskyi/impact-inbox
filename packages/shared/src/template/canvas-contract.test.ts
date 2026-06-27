import { describe, expect, it } from "vitest";
import {
  CANVAS_BLOCK_TYPE_ATTR,
  CANVAS_PLAIN_TEXT_EDITABLE_TYPES,
  CANVAS_RICHTEXT_EDITABLE_TYPES,
  getCanvasEditableKind,
  isCanvasEditableBlockType,
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
    expect(CANVAS_PLAIN_TEXT_EDITABLE_TYPES).toEqual(["heading", "text"]);
    expect(CANVAS_RICHTEXT_EDITABLE_TYPES).toEqual(["richtext"]);
  });
});
