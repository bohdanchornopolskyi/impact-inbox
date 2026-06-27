export const RICHTEXT_HEADING_INLINE_STYLES: Record<
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  string
> = {
  h1: "font-size:32px;font-weight:700;margin:0",
  h2: "font-size:24px;font-weight:700;margin:0",
  h3: "font-size:20px;font-weight:700;margin:0",
  h4: "font-size:18px;font-weight:600;margin:0",
  h5: "font-size:16px;font-weight:600;margin:0",
  h6: "font-size:14px;font-weight:600;margin:0",
};

const RICHTEXT_HEADING_TAGS = Object.keys(
  RICHTEXT_HEADING_INLINE_STYLES,
) as Array<keyof typeof RICHTEXT_HEADING_INLINE_STYLES>;

export function mergeRichtextHeadingStyle(
  tagName: string,
  style: string | undefined,
): string {
  if (!RICHTEXT_HEADING_TAGS.includes(tagName as keyof typeof RICHTEXT_HEADING_INLINE_STYLES)) {
    return style ?? "";
  }

  const defaults =
    RICHTEXT_HEADING_INLINE_STYLES[
      tagName as keyof typeof RICHTEXT_HEADING_INLINE_STYLES
    ];

  const merged = new Map<string, string>();

  for (const chunk of (style ?? "").split(";")) {
    const trimmed = chunk.trim();
    if (!trimmed) {
      continue;
    }

    const colon = trimmed.indexOf(":");
    if (colon === -1) {
      continue;
    }

    const prop = trimmed.slice(0, colon).trim().toLowerCase();
    const value = trimmed.slice(colon + 1).trim();
    merged.set(prop, value);
  }

  for (const chunk of defaults.split(";")) {
    const trimmed = chunk.trim();
    if (!trimmed) {
      continue;
    }

    const colon = trimmed.indexOf(":");
    if (colon === -1) {
      continue;
    }

    const prop = trimmed.slice(0, colon).trim().toLowerCase();
    const value = trimmed.slice(colon + 1).trim();
    if (!merged.has(prop)) {
      merged.set(prop, value);
    }
  }

  if (merged.size === 0) {
    return "";
  }

  return Array.from(merged.entries())
    .map(([prop, value]) => `${prop}:${value}`)
    .join(";");
}
