import {
  CANVAS_EDITABLE_ATTR,
  CANVAS_EDITABLE_KIND_ATTR,
  CANVAS_EDITABLE_PROP_ATTR,
} from "@repo/shared";
import type { CSSProperties, ReactNode } from "react";
import { Img, Link, Section } from "react-email";
import { alignedBlockStyle, alignedImageStyle } from "../align";
import { blockStylesToCss } from "../styles";
import type { RenderContext } from "./content-block-registry";

export function editableText(text: string) {
  return (
    <span
      {...{
        [CANVAS_EDITABLE_ATTR]: "",
        [CANVAS_EDITABLE_PROP_ATTR]: "text",
      }}
    >
      {text}
    </span>
  );
}

export function editableRichtext(html: string) {
  return (
    <div
      {...{
        [CANVAS_EDITABLE_ATTR]: "",
        [CANVAS_EDITABLE_PROP_ATTR]: "html",
        [CANVAS_EDITABLE_KIND_ATTR]: "richtext",
      }}
      style={{ fontWeight: 400, margin: 0 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

type ImageSectionBlock = {
  id: string;
  styles?: Parameters<typeof blockStylesToCss>[0];
};

export function renderLinkedImageSection(options: {
  block: ImageSectionBlock;
  align?: Parameters<typeof alignedBlockStyle>[0];
  context: RenderContext;
  image: ReactNode;
  href?: string;
}) {
  const { block, align, context, image, href } = options;
  const content = href ? (
    <Link href={href} style={{ color: context.settings.linkColor }}>
      {image}
    </Link>
  ) : (
    image
  );

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align),
      }}
    >
      {content}
    </Section>
  );
}

export function buildAlignedImage(options: {
  src: string;
  alt: string;
  align?: Parameters<typeof alignedImageStyle>[0];
  width?: number | "100%";
  maxHeight?: number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { src, alt, align, width, maxHeight, borderRadius, className, style } = options;

  return (
    <Img
      src={src}
      alt={alt}
      className={className}
      width={width === "100%" ? undefined : width}
      style={{
        ...alignedImageStyle(align),
        ...style,
        width: width === "100%" ? "100%" : width ? `${width}px` : "auto",
        height: "auto",
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
      }}
    />
  );
}
