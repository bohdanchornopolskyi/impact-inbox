import { Section } from "@react-email/components";
import type { HtmlBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { registerBlock } from "./content-block-registry";

export function renderHtmlBlock(block: HtmlBlock) {
  return (
    <Section
      key={block.id}
      style={blockStylesToCss(block.styles)}
      dangerouslySetInnerHTML={{ __html: block.props.html }}
    />
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function renderHtmlBlockText(block: HtmlBlock): string {
  return stripHtml(block.props.html);
}

registerBlock("html", { html: renderHtmlBlock, text: renderHtmlBlockText });
