import type { ImageBlock } from "@repo/shared";
import { buildAlignedImage, renderLinkedImageSection } from "./block-utils";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderImageBlock(block: ImageBlock, context: RenderContext) {
  const { src, alt, href, width, borderRadius, align } = block.props;

  return renderLinkedImageSection({
    block,
    align,
    context,
    href,
    image: buildAlignedImage({
      src,
      alt: block.props.decorative ? "" : (alt ?? ""),
      align,
      width,
      borderRadius,
      className: block.props.fullWidthOnMobile ? "image-full-mobile" : undefined,
    }),
  });
}

function renderImageBlockText(block: ImageBlock): string {
  return block.props.alt ?? block.props.src;
}

registerBlock("image", { html: renderImageBlock, text: renderImageBlockText });
