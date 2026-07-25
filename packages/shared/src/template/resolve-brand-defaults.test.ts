import { describe, expect, it } from "vitest";
import {
  TEMPLATE_DEFAULT_COLORS,
  TEMPLATE_DEFAULT_SPACING,
} from "../constants/template";
import {
  resolveBlockDefaults,
  resolveTemplateSettingsFromBrand,
} from "./resolve-brand-defaults";
import { createContentBlock, createEmptyTemplateContent } from "./create-block";

describe("resolve-brand-defaults", () => {
  it("falls back to platform colors when brand kit is empty", () => {
    const button = resolveBlockDefaults("button", null);
    expect(button.props.backgroundColor).toBe(
      TEMPLATE_DEFAULT_COLORS.buttonBackground,
    );
    expect(button.props.textColor).toBe(TEMPLATE_DEFAULT_COLORS.buttonText);
  });

  it("bakes brand primary into new buttons", () => {
    const button = createContentBlock("button", {
      colors: { primary: "#c45c26", onPrimary: "#fff7ed" },
      spacing: { buttonBorderRadius: 12, contentBlockGap: 20 },
    });

    expect(button.props).toMatchObject({
      backgroundColor: "#c45c26",
      textColor: "#fff7ed",
      borderRadius: 12,
    });
    expect(button.styles).toEqual({ padding: { bottom: 20 } });
  });

  it("seeds template settings from brand kit", () => {
    const content = createEmptyTemplateContent({
      colors: {
        primary: "#4f46e5",
        pageBackground: "#0f172a",
        contentBackground: "#ffffff",
        text: "#1e293b",
      },
      fontFamily: "Georgia, serif",
      spacing: { sectionPadding: 40 },
    });

    expect(content.settings).toMatchObject({
      linkColor: "#4f46e5",
      backgroundColor: "#0f172a",
      contentBackgroundColor: "#ffffff",
      textColor: "#1e293b",
      fontFamily: "Georgia, serif",
    });
    expect(content.body[0]?.styles).toEqual({ padding: 40 });
  });

  it("uses platform section padding without a kit", () => {
    const settings = resolveTemplateSettingsFromBrand(null);
    expect(settings.linkColor).toBe(TEMPLATE_DEFAULT_COLORS.link);
    expect(settings.backgroundColor).toBe(
      TEMPLATE_DEFAULT_COLORS.pageBackground,
    );
    const section = resolveBlockDefaults("section", null);
    expect(section.styles).toEqual({
      padding: TEMPLATE_DEFAULT_SPACING.sectionPadding,
    });
  });
});
