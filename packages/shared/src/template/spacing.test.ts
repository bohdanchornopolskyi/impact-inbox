import { describe, expect, it } from "vitest";
import { resolveSpacingSides, spacingFromSides } from "./spacing";

describe("resolveSpacingSides", () => {
  it("treats missing spacing as zero on every side", () => {
    expect(resolveSpacingSides(undefined)).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it("expands a number to all sides", () => {
    expect(resolveSpacingSides(24)).toEqual({
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
    });
  });

  it("surfaces the content-gap default instead of blank sides", () => {
    expect(resolveSpacingSides({ bottom: 16 })).toEqual({
      top: 0,
      right: 0,
      bottom: 16,
      left: 0,
    });
  });

  it("follows CSS shorthand fallbacks for partial objects", () => {
    expect(resolveSpacingSides({ top: 10 })).toEqual({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    });
    expect(resolveSpacingSides({ top: 10, right: 4 })).toEqual({
      top: 10,
      right: 4,
      bottom: 10,
      left: 4,
    });
  });
});

describe("spacingFromSides", () => {
  it("drops spacing when every side is cleared", () => {
    expect(
      spacingFromSides({ top: 0, right: 0, bottom: 0, left: 0 }),
    ).toBeUndefined();
  });

  it("collapses uniform sides to a number", () => {
    expect(spacingFromSides({ top: 8, right: 8, bottom: 8, left: 8 })).toBe(8);
  });

  it("keeps mixed sides as an object", () => {
    expect(spacingFromSides({ top: 0, right: 0, bottom: 16, left: 0 })).toEqual({
      top: 0,
      right: 0,
      bottom: 16,
      left: 0,
    });
  });
});
