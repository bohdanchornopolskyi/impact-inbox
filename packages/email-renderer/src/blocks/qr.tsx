import { Img, Section } from "@react-email/components";
import type { QrBlock } from "@repo/shared";
import { alignedBlockStyle, alignedImageStyle } from "../align";
import { blockStylesToCss } from "../styles";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderQrBlock(block: QrBlock, context: RenderContext) {
  const { align, size } = block.props;
  const src = context.qrImages.get(block.id);

  if (!src) {
    throw new Error(`QR image not generated for block: ${block.id}`);
  }

  const dimension = size ?? 150;

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align),
      }}
    >
      <Img
        src={src}
        alt="QR code"
        width={dimension}
        height={dimension}
        style={{
          ...alignedImageStyle(align),
          display: "block",
        }}
      />
    </Section>
  );
}

function renderQrBlockText(block: QrBlock): string {
  return block.props.data;
}

registerBlock("qr", { html: renderQrBlock, text: renderQrBlockText });
