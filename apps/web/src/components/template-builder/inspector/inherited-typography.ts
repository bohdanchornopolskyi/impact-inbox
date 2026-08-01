import { DEFAULT_TEMPLATE_SETTINGS, type TemplateSettings } from "@repo/shared";

/**
 * What a block renders at when its own typography prop is unset. Mirrors the
 * `props.x ?? settings.x ?? default` chain in the text/richtext renderers so an
 * empty inspector field can show the value that is actually applied.
 */
export function inheritedFontSize(
  blockType: string,
  settings: TemplateSettings,
): number | undefined {
  if (blockType !== "text" && blockType !== "richtext") {
    return undefined;
  }

  return settings.fontSize ?? DEFAULT_TEMPLATE_SETTINGS.fontSize;
}

export function inheritedLineHeight(
  blockType: string,
  settings: TemplateSettings,
): number | undefined {
  if (blockType === "text" || blockType === "richtext") {
    return settings.lineHeight ?? DEFAULT_TEMPLATE_SETTINGS.lineHeight;
  }

  // Headings inherit the setting but have no numeric fallback of their own.
  return blockType === "heading" ? settings.lineHeight : undefined;
}
