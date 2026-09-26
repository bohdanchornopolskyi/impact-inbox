import { describe, expect, it } from "vitest";
import { themeColor } from "@repo/shared";
import {
  brandSwatches,
  hexToHsva,
  hsvaToHex,
  isValidHex,
  nextRecentColors,
  normalizeHex,
  parseRecentColors,
  resolveColorDraft,
  shouldPersistColorDraft,
  toHexDigits,
} from "./color";

describe("color picker draft helpers", () => {
  it("resolves unset values to the canvas fallback", () => {
    expect(resolveColorDraft(undefined, "#2563eb")).toBe("#2563eb");
    expect(resolveColorDraft(undefined)).toBe("#000000");
    expect(resolveColorDraft("#FFFFFF", "#2563eb")).toBe("#ffffff");
  });

  it("does not persist blur when draft still equals the fallback", () => {
    expect(shouldPersistColorDraft("#2563eb", undefined, "#2563eb")).toBe(
      false,
    );
    expect(shouldPersistColorDraft("#000000", undefined)).toBe(false);
    expect(shouldPersistColorDraft("#111111", undefined, "#2563eb")).toBe(
      true,
    );
  });

  it("normalizes hex input", () => {
    expect(normalizeHex("2563EB")).toBe("#2563eb");
    expect(normalizeHex("#2563EB")).toBe("#2563eb");
  });
});

describe("color conversion", () => {
  it("accepts hex with or without a hash", () => {
    expect(isValidHex("4F46E5")).toBe(true);
    expect(isValidHex("#4F46E5")).toBe(true);
    expect(isValidHex("#4F46E")).toBe(false);
    expect(isValidHex("blue")).toBe(false);
  });

  it("formats hex digits for the field", () => {
    expect(toHexDigits("#4f46e5")).toBe("4F46E5");
  });

  it("round-trips brand indigo through hsv", () => {
    const hex = "#4f46e5";
    expect(hsvaToHex(hexToHsva(hex))).toBe(hex);
  });

  it("keeps hue when converting a gray", () => {
    expect(hexToHsva("#808080", 240).h).toBe(240);
  });
});

describe("color palettes", () => {
  it("replaces the first brand swatch when primary is a valid hex", () => {
    expect(brandSwatches("#22c55e")[0]).toBe("#22c55e");
    expect(brandSwatches("#22c55e")).toHaveLength(7);
    expect(brandSwatches("nope")[0]).toBe(themeColor("--color-brand-500"));
  });

  it("keeps recents unique and most-recent first", () => {
    expect(nextRecentColors(["#111111", "#222222"], "#333333")).toEqual([
      "#333333",
      "#111111",
      "#222222",
    ]);
    expect(nextRecentColors(["#111111", "#222222"], "#111111")).toEqual([
      "#111111",
      "#222222",
    ]);
  });

  it("parses stored recents and drops junk", () => {
    expect(parseRecentColors('["#22c55e","nope","22C55E","#ffffff"]')).toEqual([
      "#22c55e",
      "#ffffff",
    ]);
    expect(parseRecentColors("not-json")).toEqual([]);
  });
});
