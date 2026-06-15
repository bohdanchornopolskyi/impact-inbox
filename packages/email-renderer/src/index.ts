import { type TemplateContentData } from "@repo/shared";
import {
  renderTemplateToHtml,
  renderTemplateToText,
} from "./render-template";

export type RenderedTemplate = {
  html: string;
  text: string;
};

export async function renderTemplate(
  content: TemplateContentData,
): Promise<RenderedTemplate> {
  const [html, text] = await Promise.all([
    renderTemplateToHtml(content),
    Promise.resolve(renderTemplateToText(content)),
  ]);

  return { html, text };
}

export { TemplateEmail, renderTemplatePlainText } from "./blocks/template-email";
