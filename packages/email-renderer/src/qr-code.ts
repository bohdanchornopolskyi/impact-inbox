import type { QrBlock, TemplateContentData } from "@repo/shared";
import QRCode from "qrcode";

export async function generateQrDataUri(block: QrBlock): Promise<string> {
  const { data, size, foregroundColor, backgroundColor } = block.props;

  return QRCode.toDataURL(data, {
    width: size ?? 150,
    margin: 1,
    color: {
      dark: foregroundColor ?? "#000000",
      light: backgroundColor ?? "#ffffff",
    },
  });
}

export async function buildQrImageMap(
  content: TemplateContentData,
): Promise<Map<string, string>> {
  const qrImages = new Map<string, string>();

  for (const section of content.body) {
    for (const row of section.children) {
      for (const column of row.children) {
        for (const block of column.children) {
          if (block.type === "qr") {
            qrImages.set(block.id, await generateQrDataUri(block));
          }
        }
      }
    }
  }

  return qrImages;
}
