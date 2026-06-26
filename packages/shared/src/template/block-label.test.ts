import { describe, expect, it } from "vitest";
import { createContentBlock } from "./create-block";
import { getBlockLabel, getBlockTypeLabel } from "./block-label";

describe("block-label", () => {
  it("returns definition labels with correct casing", () => {
    expect(getBlockTypeLabel("image")).toBe("Image");
    expect(getBlockTypeLabel("richtext")).toBe("Rich Text");
    expect(getBlockTypeLabel("section")).toBe("Section");
  });

  it("resolves labels from blocks", () => {
    const block = createContentBlock("button");
    expect(getBlockLabel(block)).toBe("Button");
  });
});
