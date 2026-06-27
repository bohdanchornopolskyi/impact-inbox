import sanitizeHtml from "sanitize-html";
import { mergeRichtextHeadingStyle } from "./richtext-heading-styles";

const RICHTEXT_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
];

const RICHTEXT_HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const RICHTEXT_MARGIN_RESET_TAGS = ["p", "ul", "ol"] as const;

const RICHTEXT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  ...Object.fromEntries(RICHTEXT_HEADING_TAGS.map((tag) => [tag, ["style"]])),
  ...Object.fromEntries(RICHTEXT_MARGIN_RESET_TAGS.map((tag) => [tag, ["style"]])),
};

function transformHeadingTag(tagName: string) {
  return (
    _tag: string,
    attribs: sanitizeHtml.Attributes,
  ): sanitizeHtml.Tag => ({
    tagName,
    attribs: {
      ...attribs,
      style: mergeRichtextHeadingStyle(tagName, attribs.style),
    },
  });
}

function setMarginZero(style: string | undefined): string {
  const entries = new Map<string, string>();

  for (const chunk of (style ?? "").split(";")) {
    const trimmed = chunk.trim();
    if (!trimmed) {
      continue;
    }

    const colon = trimmed.indexOf(":");
    if (colon === -1) {
      continue;
    }

    entries.set(
      trimmed.slice(0, colon).trim().toLowerCase(),
      trimmed.slice(colon + 1).trim(),
    );
  }

  entries.set("margin", "0");

  return Array.from(entries.entries())
    .map(([prop, value]) => `${prop}:${value}`)
    .join(";");
}

function transformMarginResetTag(tagName: string) {
  return (
    _tag: string,
    attribs: sanitizeHtml.Attributes,
  ): sanitizeHtml.Tag => ({
    tagName,
    attribs: {
      ...attribs,
      style: setMarginZero(attribs.style),
    },
  });
}

export function sanitizeRichtextHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: RICHTEXT_ALLOWED_TAGS,
    allowedAttributes: RICHTEXT_ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedStyles: {
      "*": {
        "font-size": [/^\d+px$/],
        "font-weight": [/^(?:[1-9]00|bold|normal)$/],
        margin: [/^0(?:px)?$/],
      },
    },
    transformTags: {
      b: "strong",
      i: "em",
      h1: transformHeadingTag("h1"),
      h2: transformHeadingTag("h2"),
      h3: transformHeadingTag("h3"),
      h4: transformHeadingTag("h4"),
      h5: transformHeadingTag("h5"),
      h6: transformHeadingTag("h6"),
      p: transformMarginResetTag("p"),
      ul: transformMarginResetTag("ul"),
      ol: transformMarginResetTag("ol"),
    },
  }).trim();
}
