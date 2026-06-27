import { Link, Section, Text } from "@react-email/components";
import type { CSSProperties } from "react";
import type { FooterBlock } from "@repo/shared";
import { alignedBlockStyle } from "../align";
import { blockStylesToCss } from "../styles";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderFooterBlock(block: FooterBlock, context: RenderContext) {
  const {
    companyName,
    address,
    copyright,
    unsubscribeUrl,
    unsubscribeLabel,
    links,
    textColor,
    fontSize,
    align,
  } = block.props;

  const color = textColor ?? context.settings.textColor ?? "#6b7280";
  const size = fontSize ?? 12;
  const textStyle: CSSProperties = {
    color,
    fontSize: size,
    fontFamily: context.settings.fontFamily,
    lineHeight: 1.6,
    margin: "4px 0",
    textAlign: align ?? "center",
  };

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align ?? "center"),
      }}
    >
      {companyName ? <Text style={textStyle}>{companyName}</Text> : null}
      {address ? <Text style={textStyle}>{address}</Text> : null}
      {links?.map((link) => (
        <Text key={`${block.id}-${link.href}`} style={textStyle}>
          <Link
            href={link.href}
            style={{ color: context.settings.linkColor ?? color, textDecoration: "underline" }}
          >
            {link.text}
          </Link>
        </Text>
      ))}
      {unsubscribeUrl ? (
        <Text style={textStyle}>
          <Link
            href={unsubscribeUrl}
            style={{ color: context.settings.linkColor ?? color, textDecoration: "underline" }}
          >
            {unsubscribeLabel ?? "Unsubscribe"}
          </Link>
        </Text>
      ) : null}
      {copyright ? <Text style={textStyle}>{copyright}</Text> : null}
    </Section>
  );
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

registerBlock("footer", { html: renderFooterBlock, text: renderFooterBlockText });
