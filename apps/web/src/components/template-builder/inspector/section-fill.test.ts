import { describe, expect, it } from "vitest";
import {
  createEmptyTemplateContent,
  templateContentSchema,
  updateBlockProps,
  updateBlockStyles,
} from "@repo/shared";
import { sectionFillChange } from "./section-fill";

describe("sectionFillChange", () => {
  it("chooses image without writing a url", () => {
    let content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    content = updateBlockStyles(content, sectionId, {
      backgroundColor: "#112233",
    });

    const patch = sectionFillChange(content.body[0]!, "image");

    expect(patch).toEqual({ styles: { backgroundColor: undefined } });
    expect(JSON.stringify(patch)).not.toContain("https://");

    content = updateBlockStyles(content, sectionId, patch!.styles!);
    expect(
      templateContentSchema.safeParse(JSON.parse(JSON.stringify(content)))
        .success,
    ).toBe(true);
    expect(content.body[0]!.props).not.toHaveProperty("backgroundImage");
  });

  it("leaves an empty section unchanged when image is chosen", () => {
    const content = createEmptyTemplateContent();
    expect(sectionFillChange(content.body[0]!, "image")).toBeNull();
  });

  it("drops a placeholder url when image is chosen", () => {
    let content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    content = updateBlockProps(content, sectionId, {
      backgroundImage: "https://",
    });

    expect(sectionFillChange(content.body[0]!, "image")).toEqual({
      props: { backgroundImage: undefined },
    });
  });

  it("returns color and image changes as one patch", () => {
    let content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    content = updateBlockProps(content, sectionId, {
      backgroundImage: "https://example.com/bg.png",
    });

    const patch = sectionFillChange(content.body[0]!, "color");

    expect(patch).toEqual({
      props: { backgroundImage: undefined },
      styles: { backgroundColor: "#F4F6F8" },
    });

    content = updateBlockProps(content, sectionId, patch!.props!);
    content = updateBlockStyles(content, sectionId, patch!.styles!);
    expect(
      templateContentSchema.safeParse(JSON.parse(JSON.stringify(content)))
        .success,
    ).toBe(true);
  });
});
