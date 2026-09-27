import { describe, expect, it } from "vitest";
import { createEmptyTemplateContent, updateBlockProps } from "@repo/shared";
import {
  canPickImageFromLibrary,
  libraryImageProps,
  libraryImageSrc,
} from "./library-image-target";

describe("library image target", () => {
  it("lets a section take a library image as its background", () => {
    expect(canPickImageFromLibrary("section")).toBe(true);
    expect(canPickImageFromLibrary("heading")).toBe(false);
    expect(
      libraryImageProps("section", "https://cdn.example.com/bg.png"),
    ).toEqual({
      backgroundImage: "https://cdn.example.com/bg.png",
    });
    expect(libraryImageProps("section", "https://")).toBeNull();
    expect(
      libraryImageProps("image", "https://cdn.example.com/photo.png", "100%"),
    ).toEqual({
      src: "https://cdn.example.com/photo.png",
      width: "100%",
    });
  });

  it("reads the section background as the current library image", () => {
    let content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    content = updateBlockProps(content, sectionId, {
      backgroundImage: "https://cdn.example.com/bg.png",
    });

    expect(libraryImageSrc(content, sectionId)).toBe(
      "https://cdn.example.com/bg.png",
    );
  });
});
