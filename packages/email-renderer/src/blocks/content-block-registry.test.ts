import { describe, expect, it } from "vitest";
import type { ContentBlock, ContentBlockType, TemplateSettings } from "@repo/shared";
import { renderContentBlock } from "./template-email";
import { renderContentBlockText } from "./plain-text";

const settings: TemplateSettings = { width: 600 };
const context = { settings, qrImages: new Map<string, string>() };

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
  logo: {
    id: "logo-1",
    type: "logo",
    props: { src: "https://example.com/logo.png", alt: "Logo" },
  },
  video: {
    id: "video-1",
    type: "video",
    props: {
      thumbnailSrc: "https://example.com/thumb.png",
      videoUrl: "https://example.com/video",
    },
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
  footer: {
    id: "footer-1",
    type: "footer",
    props: {
      companyName: "Acme Inc",
      unsubscribeUrl: "https://example.com/unsubscribe",
    },
  },
  qr: {
    id: "qr-1",
    type: "qr",
    props: { data: "https://example.com" },
  },
};

const expectedPlainText: Record<ContentBlockType, string | null> = {
  heading: "Hello",
  text: "Body copy",
  richtext: "Rich text",
  button: "Click me: https://example.com",
  image: "Example image",
  logo: "Logo",
  video: "Watch Video: https://example.com/video",
  divider: "---",
  spacer: "",
  social: "twitter: https://twitter.com/example",
  html: "Bold",
  table: "Name | Value\nFoo | Bar",
  shape: "",
  footer: "Acme Inc\nUnsubscribe: https://example.com/unsubscribe",
  qr: "https://example.com",
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
      const htmlContext =
        type === "qr"
          ? {
              ...context,
              qrImages: new Map([[block.id, "data:image/png;base64,abc"]]),
            }
          : context;

      expect(() => renderContentBlock(block, htmlContext)).not.toThrow();
    });
  }

  it("renders social block with icon image", () => {
    const html = renderContentBlock(fixtures.social, context);
    const serialized = JSON.stringify(html);

    expect(serialized).toContain("data:image/svg+xml");
  });

  it("renders qr block with generated image src", () => {
    const qrContext = {
      ...context,
      qrImages: new Map([["qr-1", "data:image/png;base64,abc"]]),
    };
    const html = renderContentBlock(fixtures.qr, qrContext);
    const serialized = JSON.stringify(html);

    expect(serialized).toContain("data:image/png;base64,abc");
  });

  it("renders triangle shape with border styles", () => {
    const triangle = {
      id: "shape-triangle",
      type: "shape" as const,
      props: { shape: "triangle" as const, color: "#ff0000", width: 40, height: 30 },
    };
    const html = renderContentBlock(triangle, context);
    const serialized = JSON.stringify(html);

    expect(serialized).toContain("borderBottom");
  });
});
