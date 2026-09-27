import { findBlock, type TemplateBlockType, type TemplateContentData } from "@repo/shared";
import { isBackgroundImageUrl } from "./section-fill";

export function canPickImageFromLibrary(
  type: TemplateBlockType,
): type is "image" | "logo" | "video" | "section" {
  return (
    type === "image" ||
    type === "logo" ||
    type === "video" ||
    type === "section"
  );
}

export function libraryImageSrc(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string {
  if (!selectedBlockId) {
    return "";
  }

  const found = findBlock(content, selectedBlockId);
  if (!found) {
    return "";
  }

  if (found.block.type === "video") {
    return found.block.props.thumbnailSrc;
  }

  if (found.block.type === "image" || found.block.type === "logo") {
    return found.block.props.src;
  }

  if (found.block.type === "section") {
    const image = found.block.props.backgroundImage;
    return typeof image === "string" ? image : "";
  }

  return "";
}

export function libraryImageProps(
  type: "image" | "logo" | "video" | "section",
  url: string,
  width?: number | "100%",
): Record<string, unknown> | null {
  if (!isBackgroundImageUrl(url)) {
    return null;
  }

  if (type === "section") {
    return { backgroundImage: url };
  }

  if (type === "video") {
    return { thumbnailSrc: url };
  }

  return width === undefined ? { src: url } : { src: url, width };
}
