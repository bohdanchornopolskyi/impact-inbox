import { render } from "@react-email/render";
import { type TemplateContentData } from "@repo/shared";
import {
  TemplateEmail,
  renderTemplatePlainText,
} from "./blocks/template-email";

export async function renderTemplateToHtml(
  content: TemplateContentData,
): Promise<string> {
  return render(<TemplateEmail content={content} />);
}

export function renderTemplateToText(content: TemplateContentData): string {
  return renderTemplatePlainText(content);
}
