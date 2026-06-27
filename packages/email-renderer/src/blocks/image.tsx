import type { ImageBlock } from "@repo/shared";
import { buildAlignedImage, renderLinkedImageSection } from "./block-utils";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderImageBlock(block: ImageBlock, context: RenderContext) {
  const { src, alt, href, width, height, borderRadius, align } = block.props;

  return renderLinkedImageSection({
    block,
    align,
    context,
    href,
    image: buildAlignedImage({
      src,
      alt: alt ?? "",
      align,
      width,
      height,
      borderRadius,
    }),
  });
}

function renderImageBlockText(block: ImageBlock): string {
  return block.props.alt ?? block.props.src;
}

registerBlock("image", { html: renderImageBlock, text: renderImageBlockText });
