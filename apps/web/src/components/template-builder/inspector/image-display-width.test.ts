import { describe, expect, it } from "vitest";
import { PLACEHOLDER_IMAGE_URL } from "@repo/shared";
import {
  aspectRatioLabel,
  cappedDisplayWidth,
  fallbackImageWidth,
  formatAssetBytes,
  formatLibraryTileMeta,
  imageSizingMode,
  imageWidthCap,
  isPlaceholderImageSrc,
} from "./image-display-width";

describe("cappedDisplayWidth", () => {
  it("keeps a small image at its natural width", () => {
    expect(cappedDisplayWidth(240, 600)).toBe(240);
  });

  it("caps a wide image to the template width", () => {
    expect(cappedDisplayWidth(2400, 600)).toBe(600);
  });
});

describe("imageWidthCap", () => {
  it("uses the template width for content images", () => {
    expect(imageWidthCap("image", 600)).toBe(600);
  });

  it("caps logos below the template width", () => {
    expect(imageWidthCap("logo", 600)).toBe(180);
  });
});

describe("fallbackImageWidth", () => {
  it("fits content images to the container when size is unknown", () => {
    expect(fallbackImageWidth("image")).toBe("100%");
  });

  it("uses a compact width for logos when size is unknown", () => {
    expect(fallbackImageWidth("logo")).toBe(120);
  });
});

describe("isPlaceholderImageSrc", () => {
  it("detects the stock placeholder", () => {
    expect(isPlaceholderImageSrc(PLACEHOLDER_IMAGE_URL)).toBe(true);
    expect(isPlaceholderImageSrc("https://cdn.example.com/photo.png")).toBe(
      false,
    );
  });
});

describe("aspectRatioLabel", () => {
  it("simplifies square and widescreen ratios", () => {
    expect(aspectRatioLabel(800, 800)).toBe("1:1");
    expect(aspectRatioLabel(1920, 1080)).toBe("16:9");
  });

  it("hides awkward ratios", () => {
    expect(aspectRatioLabel(800, 533)).toBeNull();
  });
});

describe("formatAssetBytes", () => {
  it("formats kilobytes the way the inspector chip does", () => {
    expect(formatAssetBytes(148 * 1024)).toBe("148 KB");
  });
});

describe("formatLibraryTileMeta", () => {
  it("joins dimensions and size the way the library tile does", () => {
    expect(formatLibraryTileMeta(1600, 900, 184 * 1024)).toBe(
      "1600 × 900 · 184 KB",
    );
  });

  it("falls back to size when dimensions are unknown", () => {
    expect(formatLibraryTileMeta(null, null, 184 * 1024)).toBe("184 KB");
  });
});

describe("imageSizingMode", () => {
  it("treats 100% width as fill", () => {
    expect(imageSizingMode("100%", 800, 600)).toBe("fill");
  });

  it("treats a capped natural width as original", () => {
    expect(imageSizingMode(600, 2400, 600)).toBe("original");
    expect(imageSizingMode(240, 240, 600)).toBe("original");
  });

  it("treats any other pixel width as custom", () => {
    expect(imageSizingMode(400, 800, 600)).toBe("custom");
  });
});
