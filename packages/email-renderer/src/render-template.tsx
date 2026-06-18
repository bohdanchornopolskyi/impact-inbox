import { render } from "@react-email/render";
import { type TemplateContentData } from "@repo/shared";
import { buildQrImageMap } from "./qr-code";
import {
  TemplateEmail,
  renderTemplatePlainText,
} from "./blocks/template-email";

export async function renderTemplateToHtml(
  content: TemplateContentData,
): Promise<string> {
  const qrImages = await buildQrImageMap(content);

  return render(<TemplateEmail content={content} qrImages={qrImages} />);
}

export function renderTemplateToText(content: TemplateContentData): string {
  return renderTemplatePlainText(content);
}
