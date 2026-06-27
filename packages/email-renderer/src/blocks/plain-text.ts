import type {
  ContentBlock,
  DividerBlock,
  FooterBlock,
  HtmlBlock,
  ImageBlock,
  LogoBlock,
  QrBlock,
  ShapeBlock,
  SocialBlock,
  SpacerBlock,
  TableBlock,
  VideoBlock,
} from "@repo/shared";
import {
  renderContentBlockTextDispatch,
} from "./content-block-registry";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function renderImageBlockText(block: ImageBlock): string {
  return block.props.alt ?? block.props.src;
}

export function renderLogoBlockText(block: LogoBlock): string {
  return block.props.alt ?? "Logo";
}

export function renderVideoBlockText(block: VideoBlock): string {
  const label = block.props.playLabel ?? "Watch Video";
  return `${label}: ${block.props.videoUrl}`;
}

export function renderFooterBlockText(block: FooterBlock): string {
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

export function renderQrBlockText(block: QrBlock): string {
  return block.props.data;
}

export function renderDividerBlockText(): string {
  return "---";
}

export function renderSpacerBlockText(): string {
  return "";
}

export function renderSocialBlockText(block: SocialBlock): string {
  return block.props.links
    .map((link) => `${link.label ?? link.platform}: ${link.url}`)
    .join("\n");
}

export function renderHtmlBlockText(block: HtmlBlock): string {
  return stripHtml(block.props.html);
}

export function renderTableBlockText(block: TableBlock): string {
  const headers = block.props.columns.map((column) => column.header).join(" | ");
  const rows = block.props.rows.map((row) => row.join(" | ")).join("\n");
  return `${headers}\n${rows}`;
}

export function renderShapeBlockText(): string {
  return "";
}

export function renderContentBlockText(block: ContentBlock): string | null {
  return renderContentBlockTextDispatch(block);
}
