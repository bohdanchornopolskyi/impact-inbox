import { describe, expect, it } from "vitest";
import {
  brandKitFromData,
  normalizeBrandKit,
  type BrandKitFields,
} from "../schemas/brand-kit";

describe("brand-kit helpers", () => {
  it("normalizes empty fields to null", () => {
    expect(normalizeBrandKit({})).toBeNull();
    expect(
      normalizeBrandKit({
        colors: {},
        logoUrl: "  ",
        fontFamily: "",
        spacing: {},
      }),
    ).toBeNull();
  });

  it("keeps trimmed kit fields", () => {
    const fields: BrandKitFields = {
      colors: { primary: " #112233 ", onPrimary: "" },
      logoUrl: " https://cdn.example/logo.png ",
      fontFamily: " Inter ",
      spacing: { sectionPadding: 40 },
    };

    expect(normalizeBrandKit(fields)).toEqual({
      colors: { primary: "#112233" },
      logoUrl: "https://cdn.example/logo.png",
      fontFamily: "Inter",
      spacing: { sectionPadding: 40 },
    });
  });

  it("round-trips null and populated kits for the settings form", () => {
    expect(brandKitFromData(null)).toMatchObject({
      colors: {},
      logoUrl: "",
      fontFamily: "",
      spacing: {},
    });

    const populated = brandKitFromData({
      colors: { primary: "#000000" },
      fontFamily: "Georgia",
    });
    expect(populated.colors?.primary).toBe("#000000");
    expect(populated.fontFamily).toBe("Georgia");
  });
});
