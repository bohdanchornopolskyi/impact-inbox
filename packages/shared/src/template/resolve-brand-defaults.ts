import type { ContentBlockType } from "../schemas/template/blocks/content";
import type { BrandKitData } from "../schemas/brand-kit";
import type { TemplateSettings } from "../schemas/template/settings";
import type { BlockStyles } from "../schemas/template/styles";
import {
  DEFAULT_TEMPLATE_SETTINGS,
  TEMPLATE_BLOCK_DEFINITIONS,
  TEMPLATE_DEFAULT_COLORS,
  TEMPLATE_DEFAULT_SPACING,
} from "../constants/template";

export type ResolvedBlockDefaults = {
  props: Record<string, unknown>;
  styles?: BlockStyles;
};

function pickColor(
  brand: string | undefined,
  platform: string,
): string {
  return brand && brand.trim() ? brand.trim() : platform;
}

export function resolveTemplateSettingsFromBrand(
  brandKit?: BrandKitData | null,
): TemplateSettings {
  const colors = brandKit?.colors;
  return {
    width: DEFAULT_TEMPLATE_SETTINGS.width,
    backgroundColor: pickColor(
      colors?.pageBackground,
      TEMPLATE_DEFAULT_COLORS.pageBackground,
    ),
    contentBackgroundColor: pickColor(
      colors?.contentBackground,
      TEMPLATE_DEFAULT_COLORS.contentBackground,
    ),
    textColor: pickColor(colors?.text, TEMPLATE_DEFAULT_COLORS.text),
    linkColor: pickColor(
      colors?.link ?? colors?.primary,
      TEMPLATE_DEFAULT_COLORS.link,
    ),
    fontSize: brandKit?.fontSize ?? DEFAULT_TEMPLATE_SETTINGS.fontSize,
    lineHeight: brandKit?.lineHeight ?? DEFAULT_TEMPLATE_SETTINGS.lineHeight,
    ...(brandKit?.fontFamily?.trim()
      ? { fontFamily: brandKit.fontFamily.trim() }
      : {}),
  };
}

export function resolveContentBlockGap(
  brandKit?: BrandKitData | null,
): number {
  return (
    brandKit?.spacing?.contentBlockGap ?? TEMPLATE_DEFAULT_SPACING.contentBlockGap
  );
}

export function resolveSectionPadding(
  brandKit?: BrandKitData | null,
): number {
  return (
    brandKit?.spacing?.sectionPadding ?? TEMPLATE_DEFAULT_SPACING.sectionPadding
  );
}

export function resolveBlockDefaults(
  type: ContentBlockType | "section" | "row" | "column",
  brandKit?: BrandKitData | null,
): ResolvedBlockDefaults {
  const definition = TEMPLATE_BLOCK_DEFINITIONS[type] as {
    defaultProps: Record<string, unknown>;
    defaultStyles?: BlockStyles;
  };
  const props = structuredClone(definition.defaultProps);
  let styles = definition.defaultStyles
    ? structuredClone(definition.defaultStyles)
    : undefined;

  const colors = brandKit?.colors;
  const spacing = brandKit?.spacing;
  const gap = resolveContentBlockGap(brandKit);

  if (type === "section") {
    styles = { padding: resolveSectionPadding(brandKit) };
    return { props, styles };
  }

  if (type === "row" || type === "column") {
    return { props, ...(styles ? { styles } : {}) };
  }

  if (styles?.padding && typeof styles.padding === "object") {
    styles = {
      ...styles,
      padding: { ...styles.padding, bottom: gap },
    };
  } else if (type !== "spacer") {
    styles = { ...(styles ?? {}), padding: { bottom: gap } };
  }

  switch (type) {
    case "button":
      props.backgroundColor = pickColor(
        colors?.primary,
        TEMPLATE_DEFAULT_COLORS.buttonBackground,
      );
      props.textColor = pickColor(
        colors?.onPrimary,
        TEMPLATE_DEFAULT_COLORS.buttonText,
      );
      if (spacing?.buttonBorderRadius !== undefined) {
        props.borderRadius = spacing.buttonBorderRadius;
      }
      if (spacing?.buttonPaddingX !== undefined) {
        props.paddingX = spacing.buttonPaddingX;
      }
      if (spacing?.buttonPaddingY !== undefined) {
        props.paddingY = spacing.buttonPaddingY;
      }
      break;
    case "heading":
      props.color = pickColor(
        colors?.heading ?? colors?.text,
        TEMPLATE_DEFAULT_COLORS.heading,
      );
      if (brandKit?.headingFontSize !== undefined) {
        props.fontSize = brandKit.headingFontSize;
      }
      break;
    case "text":
    case "richtext":
      props.color = pickColor(colors?.text, TEMPLATE_DEFAULT_COLORS.text);
      if (type === "text" && brandKit?.fontSize !== undefined) {
        props.fontSize = brandKit.fontSize;
      }
      break;
    case "divider":
      break;
    case "logo":
      if (brandKit?.logoUrl?.trim()) {
        props.src = brandKit.logoUrl.trim();
      }
      break;
    default:
      break;
  }

  return { props, ...(styles ? { styles } : {}) };
}
