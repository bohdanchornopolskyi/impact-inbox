import { Img, Link, Section } from "@react-email/components";
import type { SocialBlock } from "@repo/shared";
import { getSocialIconSrc } from "../social-icons";
import { blockStylesToCss } from "../styles";
import { registerBlock } from "./content-block-registry";

export function renderSocialBlock(block: SocialBlock) {
  const { links, iconSize, gap, backgroundColor, iconColor } = block.props;
  const circle = iconSize ?? 28;
  const glyph = Math.max(14, Math.round(circle * 0.5));
  const fill = backgroundColor ?? "rgba(15, 23, 42, 0.05)";
  const spacing = gap ?? 14;
  const tint = iconColor ?? "#4b5563";

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        textAlign: "center",
      }}
    >
      <table cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: "0 auto" }}>
        <tbody>
          <tr>
            {links.map((link, index) => (
              <td
                key={`${block.id}-${link.platform}-${index}`}
                style={{
                  paddingRight: index < links.length - 1 ? spacing : 0,
                }}
              >
                <Link href={link.url} style={{ textDecoration: "none" }}>
                  <table
                    cellPadding={0}
                    cellSpacing={0}
                    role="presentation"
                    width={circle}
                    height={circle}
                    style={{
                      width: circle,
                      height: circle,
                      backgroundColor: fill,
                      borderRadius: 999,
                    }}
                  >
                    <tbody>
                      <tr>
                        <td
                          align="center"
                          valign="middle"
                          height={circle}
                          style={{ height: circle, textAlign: "center" }}
                        >
                          <Img
                            src={getSocialIconSrc(link.platform, tint)}
                            alt={link.label ?? link.platform}
                            width={glyph}
                            height={glyph}
                            style={{ display: "block", margin: "0 auto" }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

function renderSocialBlockText(block: SocialBlock): string {
  return block.props.links
    .map((link) => `${link.label ?? link.platform}: ${link.url}`)
    .join("\n");
}

registerBlock("social", { html: renderSocialBlock, text: renderSocialBlockText });
