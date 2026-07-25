import {
  walkContentBlocks,
  TEMPLATE_DEFAULT_COLORS,
  type QrBlock,
  type TemplateContentData,
} from "@repo/shared";
import QRCode from "qrcode";

export async function generateQrDataUri(block: QrBlock): Promise<string> {
  const { data, size, foregroundColor, backgroundColor } = block.props;

  return QRCode.toDataURL(data, {
    width: size ?? 150,
    margin: 1,
    color: {
      dark: foregroundColor ?? TEMPLATE_DEFAULT_COLORS.qrForeground,
      light: backgroundColor ?? TEMPLATE_DEFAULT_COLORS.qrBackground,
    },
  });
}

export async function buildQrImageMap(
  content: TemplateContentData,
): Promise<Map<string, string>> {
  const qrImages = new Map<string, string>();

  const qrBlocks: QrBlock[] = [];
  walkContentBlocks(content, ({ block }) => {
    if (block.type === "qr") {
      qrBlocks.push(block);
    }
  });

  for (const block of qrBlocks) {
    qrImages.set(block.id, await generateQrDataUri(block));
  }

  return qrImages;
}
