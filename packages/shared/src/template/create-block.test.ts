import { describe, expect, it } from "vitest";
import {
  TEMPLATE_DEFAULT_COLORS,
  TEMPLATE_DEFAULT_SPACING,
} from "../constants/template";
import {
  createContentBlock,
  createEmptyTemplateContent,
  createSectionBlock,
} from "./create-block";

describe("create-block defaults", () => {
  it("creates buttons with canvas-matching colors and spacing", () => {
    const button = createContentBlock("button");

    expect(button.props).toMatchObject({
      backgroundColor: TEMPLATE_DEFAULT_COLORS.buttonBackground,
      textColor: TEMPLATE_DEFAULT_COLORS.buttonText,
      borderRadius: 6,
      paddingX: 24,
      paddingY: 13,
    });
    expect(button.styles).toEqual({
      padding: { bottom: TEMPLATE_DEFAULT_SPACING.contentBlockGap },
    });
  });

  it("creates headings with the email type scale", () => {
    const heading = createContentBlock("heading");

    expect(heading.props).toMatchObject({
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 1.2,
    });
    expect(heading.styles).toMatchObject({
      letterSpacing: -0.6,
      padding: { bottom: TEMPLATE_DEFAULT_SPACING.contentBlockGap },
    });
  });

  it("creates sections with edge padding", () => {
    const section = createSectionBlock();

    expect(section.styles).toEqual({
      padding: TEMPLATE_DEFAULT_SPACING.sectionPadding,
    });
  });

  it("seeds new templates with shell color settings", () => {
    const content = createEmptyTemplateContent();

    expect(content.settings).toMatchObject({
      backgroundColor: TEMPLATE_DEFAULT_COLORS.pageBackground,
      contentBackgroundColor: TEMPLATE_DEFAULT_COLORS.contentBackground,
      textColor: TEMPLATE_DEFAULT_COLORS.text,
      linkColor: TEMPLATE_DEFAULT_COLORS.link,
    });
    expect(content.body[0]?.styles).toEqual({
      padding: TEMPLATE_DEFAULT_SPACING.sectionPadding,
    });
  });
});
