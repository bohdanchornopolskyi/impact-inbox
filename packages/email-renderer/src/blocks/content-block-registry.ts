import type { ContentBlock, ContentBlockType, TemplateSettings } from "@repo/shared";
import type { ReactNode } from "react";

export type RenderContext = {
  settings: TemplateSettings;
  qrImages: Map<string, string>;
};

type HtmlRenderer<T extends ContentBlock = ContentBlock> = (
  block: T,
  context: RenderContext,
) => ReactNode;

type TextRenderer<T extends ContentBlock = ContentBlock> = (block: T) => string | null;

type RendererEntry = {
  html?: HtmlRenderer;
  text?: TextRenderer;
};

const registry = new Map<ContentBlockType, RendererEntry>();

export function registerContentBlockRenderer<T extends ContentBlockType>(
  type: T,
  renderers: {
    html?: HtmlRenderer<Extract<ContentBlock, { type: T }>>;
    text?: TextRenderer<Extract<ContentBlock, { type: T }>>;
  },
): void {
  const existing = registry.get(type) ?? {};
  registry.set(type, { ...existing, ...renderers } as RendererEntry);
}

export function getContentBlockHtmlRenderer(
  type: ContentBlockType,
): HtmlRenderer | undefined {
  return registry.get(type)?.html;
}

export function getContentBlockTextRenderer(
  type: ContentBlockType,
): TextRenderer | undefined {
  return registry.get(type)?.text;
}

export function renderContentBlockHtml(
  block: ContentBlock,
  context: RenderContext,
): ReactNode {
  const render = getContentBlockHtmlRenderer(block.type);
  if (!render) {
    throw new Error(`No HTML renderer registered for block type: ${block.type}`);
  }
  return render(block, context);
}

export function renderContentBlockTextDispatch(
  block: ContentBlock,
): string | null {
  const render = getContentBlockTextRenderer(block.type);
  if (!render) {
    throw new Error(`No text renderer registered for block type: ${block.type}`);
  }
  return render(block);
}
