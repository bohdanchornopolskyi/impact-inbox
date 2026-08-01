import { describe, expect, it } from "vitest";
import {
  inheritedFontSize,
  inheritedLineHeight,
} from "./inherited-typography";

describe("inheritedFontSize", () => {
  it("uses the template setting when the block has none", () => {
    expect(inheritedFontSize("text", { width: 600, fontSize: 18 })).toBe(18);
  });

  it("falls back to the platform default", () => {
    expect(inheritedFontSize("richtext", { width: 600 })).toBe(16);
  });

  it("is undefined for blocks that do not inherit it", () => {
    expect(inheritedFontSize("heading", { width: 600, fontSize: 18 })).toBeUndefined();
    expect(inheritedFontSize("button", { width: 600, fontSize: 18 })).toBeUndefined();
  });
});

describe("inheritedLineHeight", () => {
  it("falls back to the platform default for text blocks", () => {
    expect(inheritedLineHeight("text", { width: 600 })).toBe(1.5);
    expect(inheritedLineHeight("richtext", { width: 600, lineHeight: 1.8 })).toBe(1.8);
  });

  it("reports a heading's inherited setting only when one is set", () => {
    expect(inheritedLineHeight("heading", { width: 600, lineHeight: 1.4 })).toBe(1.4);
    expect(inheritedLineHeight("heading", { width: 600 })).toBeUndefined();
  });
});
