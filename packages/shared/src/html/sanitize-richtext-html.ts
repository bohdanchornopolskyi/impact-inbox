import sanitizeHtml from "sanitize-html";

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

const RICHTEXT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "target", "rel"],
};

export function sanitizeRichtextHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: RICHTEXT_ALLOWED_TAGS,
    allowedAttributes: RICHTEXT_ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      b: "strong",
      i: "em",
    },
  }).trim();
}
