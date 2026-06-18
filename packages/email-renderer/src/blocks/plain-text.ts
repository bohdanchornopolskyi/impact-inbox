import type {
  ButtonBlock,
  ContentBlock,
  DividerBlock,
  FooterBlock,
  HeadingBlock,
  HtmlBlock,
  ImageBlock,
  LogoBlock,
  QrBlock,
  RichtextBlock,
  ShapeBlock,
  SocialBlock,
  SpacerBlock,
  TableBlock,
  TextBlock,
  VideoBlock,
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

function renderLogoBlockText(block: LogoBlock): string {
  return block.props.alt ?? "Logo";
}

function renderVideoBlockText(block: VideoBlock): string {
  const label = block.props.playLabel ?? "Watch Video";
  return `${label}: ${block.props.videoUrl}`;
}

function renderFooterBlockText(block: FooterBlock): string {
  const lines: string[] = [];

  if (block.props.companyName) {
    lines.push(block.props.companyName);
  }

  if (block.props.address) {
    lines.push(block.props.address);
  }

  for (const link of block.props.links ?? []) {
    lines.push(`${link.text}: ${link.href}`);
  }

  if (block.props.unsubscribeUrl) {
    lines.push(
      `${block.props.unsubscribeLabel ?? "Unsubscribe"}: ${block.props.unsubscribeUrl}`,
    );
  }

  if (block.props.copyright) {
    lines.push(block.props.copyright);
  }

  return lines.join("\n");
}

function renderQrBlockText(block: QrBlock): string {
  return block.props.data;
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
registerContentBlockRenderer("logo", { text: renderLogoBlockText });
registerContentBlockRenderer("video", { text: renderVideoBlockText });
registerContentBlockRenderer("divider", { text: renderDividerBlockText });
registerContentBlockRenderer("spacer", { text: renderSpacerBlockText });
registerContentBlockRenderer("social", { text: renderSocialBlockText });
registerContentBlockRenderer("html", { text: renderHtmlBlockText });
registerContentBlockRenderer("table", { text: renderTableBlockText });
registerContentBlockRenderer("shape", { text: renderShapeBlockText });
registerContentBlockRenderer("footer", { text: renderFooterBlockText });
registerContentBlockRenderer("qr", { text: renderQrBlockText });

export function renderContentBlockText(block: ContentBlock): string | null {
  return renderContentBlockTextDispatch(block);
}
