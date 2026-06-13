import { type TemplateContentData } from "@repo/shared";

export type RenderedTemplate = {
  html: string;
  text: string;
};

export async function renderTemplate(
  content: TemplateContentData,
): Promise<RenderedTemplate> {
  const blockSummary = content.blocks
    .map((block) => `[${block.type}]`)
    .join(" ");

  return {
    html: `<!DOCTYPE html><html><body><p>Template preview (${content.blocks.length} blocks)</p><p>${blockSummary || "Empty template"}</p></body></html>`,
    text: `Template preview (${content.blocks.length} blocks)${blockSummary ? `: ${blockSummary}` : ""}`,
  };
}
