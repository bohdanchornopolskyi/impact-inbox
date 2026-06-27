import { Column, Img, Link, Row, Section } from "@react-email/components";
import type { SocialBlock } from "@repo/shared";
import { getSocialIconSrc } from "../social-icons";
import { blockStylesToCss } from "../styles";
import { registerBlock } from "./content-block-registry";

export function renderSocialBlock(block: SocialBlock) {
  const { links, iconSize, gap, backgroundColor } = block.props;
  const size = iconSize ?? 24;

  return (
    <Section key={block.id} style={blockStylesToCss(block.styles)}>
      <Row>
        {links.map((link, index) => (
          <Column
            key={`${block.id}-${link.platform}`}
            style={{
              width: "auto",
              paddingRight: index < links.length - 1 ? (gap ?? 8) : 0,
            }}
          >
            <Link href={link.url} style={{ textDecoration: "none" }}>
              <Img
                src={getSocialIconSrc(link.platform)}
                alt={link.label ?? link.platform}
                width={size}
                height={size}
                style={{
                  display: "block",
                  backgroundColor,
                  borderRadius: backgroundColor ? "50%" : undefined,
                }}
              />
            </Link>
          </Column>
        ))}
      </Row>
    </Section>
  );
}

function renderSocialBlockText(block: SocialBlock): string {
  return block.props.links
    .map((link) => `${link.label ?? link.platform}: ${link.url}`)
    .join("\n");
}

registerBlock("social", { html: renderSocialBlock, text: renderSocialBlockText });
