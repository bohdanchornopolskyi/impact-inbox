import { describe, expect, it } from "vitest";
import type { ContentBlock, ContentBlockType, TemplateSettings } from "@repo/shared";
import { renderContentBlock } from "./template-email";
import { renderContentBlockText } from "./plain-text";

const settings: TemplateSettings = { width: 600 };

const fixtures: Record<ContentBlockType, ContentBlock> = {
  heading: { id: "heading-1", type: "heading", props: { text: "Hello", level: 1 } },
  text: { id: "text-1", type: "text", props: { text: "Body copy" } },
  richtext: {
    id: "richtext-1",
    type: "richtext",
    props: { html: "<p>Rich <strong>text</strong></p>" },
  },
  button: {
    id: "button-1",
    type: "button",
    props: { text: "Click me", href: "https://example.com" },
  },
  image: {
    id: "image-1",
    type: "image",
    props: { src: "https://example.com/image.png", alt: "Example image" },
  },
  divider: { id: "divider-1", type: "divider", props: {} },
  spacer: { id: "spacer-1", type: "spacer", props: { height: 24 } },
  social: {
    id: "social-1",
    type: "social",
    props: {
      links: [{ platform: "twitter", url: "https://twitter.com/example" }],
    },
  },
  html: { id: "html-1", type: "html", props: { html: "<b>Bold</b>" } },
  table: {
    id: "table-1",
    type: "table",
    props: {
      columns: [{ header: "Name" }, { header: "Value" }],
      rows: [["Foo", "Bar"]],
    },
  },
  shape: { id: "shape-1", type: "shape", props: { shape: "rectangle" } },
};

const expectedPlainText: Record<ContentBlockType, string | null> = {
  heading: "Hello",
  text: "Body copy",
  richtext: "Rich text",
  button: "Click me: https://example.com",
  image: "Example image",
  divider: "---",
  spacer: "",
  social: "twitter: https://twitter.com/example",
  html: "Bold",
  table: "Name | Value\nFoo | Bar",
  shape: "",
};

describe("content block registry", () => {
  for (const [type, block] of Object.entries(fixtures) as [
    ContentBlockType,
    ContentBlock,
  ][]) {
    it(`renders plain text for ${type}`, () => {
      expect(renderContentBlockText(block)).toBe(expectedPlainText[type]);
    });

    it(`dispatches HTML for ${type} without throwing`, () => {
      expect(() => renderContentBlock(block, { settings })).not.toThrow();
    });
  }
});
