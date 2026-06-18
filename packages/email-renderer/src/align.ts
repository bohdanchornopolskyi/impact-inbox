import type { BlockAlign } from "@repo/shared";
import type { CSSProperties } from "react";

export function blockAlignToTextAlign(align?: BlockAlign): CSSProperties["textAlign"] {
  return align ?? "left";
}

export function alignedBlockStyle(align?: BlockAlign): CSSProperties {
  if (align === "center") {
    return { textAlign: "center" };
  }

  if (align === "right") {
    return { textAlign: "right" };
  }

  return { textAlign: "left" };
}

export function alignedImageStyle(align?: BlockAlign): CSSProperties {
  const base: CSSProperties = {
    display: "block",
    maxWidth: "100%",
  };

  if (align === "center") {
    return { ...base, marginLeft: "auto", marginRight: "auto" };
  }

  if (align === "right") {
    return { ...base, marginLeft: "auto", marginRight: 0 };
  }

  return base;
}
