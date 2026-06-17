import type {
  ButtonBlock,
  ContentBlock,
  DividerBlock,
  HeadingBlock,
  HtmlBlock,
  ImageBlock,
  RichtextBlock,
  ShapeBlock,
  SocialBlock,
  SpacerBlock,
  TableBlock,
  TextBlock,
} from "@repo/shared";
import {
  registerContentBlockRenderer,
  renderContentBlockTextDispatch,
} from "./content-block-registry";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function renderHeadingBlockText(block: HeadingBlock): string {
  return block.props.text;
}

function renderTextBlockText(block: TextBlock): string {
  return block.props.text;
}

function renderRichtextBlockText(block: RichtextBlock): string {
  return stripHtml(block.props.html);
}

function renderButtonBlockText(block: ButtonBlock): string {
  return `${block.props.text}: ${block.props.href}`;
}

function renderImageBlockText(block: ImageBlock): string {
  return block.props.alt ?? block.props.src;
}

function renderDividerBlockText(): string {
  return "---";
}

function renderSpacerBlockText(): string {
  return "";
}

function renderSocialBlockText(block: SocialBlock): string {
  return block.props.links
    .map((link) => `${link.label ?? link.platform}: ${link.url}`)
    .join("\n");
}

function renderHtmlBlockText(block: HtmlBlock): string {
  return stripHtml(block.props.html);
}

function renderTableBlockText(block: TableBlock): string {
  const headers = block.props.columns.map((column) => column.header).join(" | ");
  const rows = block.props.rows.map((row) => row.join(" | ")).join("\n");
  return `${headers}\n${rows}`;
}

function renderShapeBlockText(): string {
  return "";
}

registerContentBlockRenderer("heading", { text: renderHeadingBlockText });
registerContentBlockRenderer("text", { text: renderTextBlockText });
registerContentBlockRenderer("richtext", { text: renderRichtextBlockText });
registerContentBlockRenderer("button", { text: renderButtonBlockText });
registerContentBlockRenderer("image", { text: renderImageBlockText });
registerContentBlockRenderer("divider", { text: renderDividerBlockText });
registerContentBlockRenderer("spacer", { text: renderSpacerBlockText });
registerContentBlockRenderer("social", { text: renderSocialBlockText });
registerContentBlockRenderer("html", { text: renderHtmlBlockText });
registerContentBlockRenderer("table", { text: renderTableBlockText });
registerContentBlockRenderer("shape", { text: renderShapeBlockText });

export function renderContentBlockText(block: ContentBlock): string | null {
  return renderContentBlockTextDispatch(block);
}
