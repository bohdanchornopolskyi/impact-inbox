import { Column, Link, Row, Section } from "react-email";
import type { LogoBlock } from "@repo/shared";
import { TEMPLATE_DEFAULT_COLORS } from "@repo/shared";
import { buildAlignedImage, renderLinkedImageSection } from "./block-utils";
import { blockStylesToCss } from "../styles";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderLogoBlock(block: LogoBlock, context: RenderContext) {
  const { src, alt, href, width, maxHeight, borderRadius, align, links, linkColor } =
    block.props;
  const image = buildAlignedImage({
    src,
    alt: alt ?? "Logo",
    align,
    width,
    maxHeight,
    borderRadius,
  });
  const visibleLinks = (links ?? []).filter((link) => link.text.trim());

  if (visibleLinks.length === 0) {
    return renderLinkedImageSection({
      block,
      align,
      context,
      href,
      image,
    });
  }

  return (
    <Section key={block.id} style={blockStylesToCss(block.styles)}>
      <Row>
        <Column>{href ? <Link href={href}>{image}</Link> : image}</Column>
        {visibleLinks.map((link) => (
          <Column key={link.text} align="right">
            <Link
              href={link.href || undefined}
              style={{
                color: linkColor ?? context.settings.linkColor ?? TEMPLATE_DEFAULT_COLORS.link,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              {link.text}
            </Link>
          </Column>
        ))}
      </Row>
    </Section>
  );
}

function renderLogoBlockText(block: LogoBlock): string {
  return block.props.alt ?? "Logo";
}

registerBlock("logo", { html: renderLogoBlock, text: renderLogoBlockText });
