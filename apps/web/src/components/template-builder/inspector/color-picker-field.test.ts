import { describe, expect, it } from "vitest";
import {
  normalizeHex,
  resolveColorDraft,
  shouldPersistColorDraft,
} from "./color-picker-field";

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
