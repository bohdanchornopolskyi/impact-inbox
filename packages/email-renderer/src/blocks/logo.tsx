import type { LogoBlock } from "@repo/shared";
import { buildAlignedImage, renderLinkedImageSection } from "./block-utils";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderLogoBlock(block: LogoBlock, context: RenderContext) {
  const { src, alt, href, width, maxHeight, borderRadius, align } = block.props;

  return renderLinkedImageSection({
    block,
    align,
    context,
    href,
    image: buildAlignedImage({
      src,
      alt: alt ?? "Logo",
      align,
      width,
      maxHeight,
      borderRadius,
    }),
  });
}

function renderLogoBlockText(block: LogoBlock): string {
  return block.props.alt ?? "Logo";
}

registerBlock("logo", { html: renderLogoBlock, text: renderLogoBlockText });
