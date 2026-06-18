import { describe, expect, it } from "vitest";
import type { TemplateContentData } from "@repo/shared";
import { renderTemplate } from "./index";

const sampleContent: TemplateContentData = {
  version: 1,
  settings: {
    width: 600,
    preheader: "Preview text",
    linkColor: "#ff0000",
    textColor: "#111111",
  },
  body: [
    {
      id: "section-1",
      type: "section",
      props: {
        backgroundImage: "https://example.com/bg.png",
        backgroundSize: "cover",
      },
      children: [
        {
          id: "row-1",
          type: "row",
          props: { gap: 12 },
          children: [
            {
              id: "col-1",
              type: "column",
              props: { width: 50 },
              children: [
                {
                  id: "heading-1",
                  type: "heading",
                  props: { text: "Hello World", level: 1 },
                  styles: { letterSpacing: 1 },
                },
                {
                  id: "logo-1",
                  type: "logo",
                  props: {
                    src: "https://example.com/logo.png",
                    align: "center",
                  },
                },
                {
                  id: "video-1",
                  type: "video",
                  props: {
                    thumbnailSrc: "https://example.com/thumb.png",
                    videoUrl: "https://example.com/video",
                  },
                },
                {
                  id: "footer-1",
                  type: "footer",
                  props: {
                    companyName: "Acme Inc",
                    unsubscribeUrl: "https://example.com/unsubscribe",
                  },
                },
                {
                  id: "qr-1",
                  type: "qr",
                  props: { data: "https://example.com/qr" },
                },
              ],
            },
            {
              id: "col-2",
              type: "column",
              props: { width: 50 },
              children: [
                {
                  id: "shape-1",
                  type: "shape",
                  props: { shape: "triangle", color: "#2563eb", width: 40, height: 40 },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe("renderTemplate", () => {
  it("returns html and plain text output", async () => {
    const result = await renderTemplate(sampleContent);

    expect(result.html).toContain("Hello World");
    expect(result.html).toContain("Watch Video");
    expect(result.html).toContain("Acme Inc");
    expect(result.html).toContain("Preview text");
    expect(result.html).toContain("#ff0000");
    expect(result.html).toContain("background-image");
    expect(result.html).toContain("letter-spacing:1px");
    expect(result.html).toContain("data:image/png;base64");
    expect(result.text).toContain("Hello World");
    expect(result.text).toContain("Watch Video: https://example.com/video");
    expect(result.text).toContain("https://example.com/qr");
  });
});
