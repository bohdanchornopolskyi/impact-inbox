import { Img, Link, Section, Text } from "@react-email/components";
import type { VideoBlock } from "@repo/shared";
import { alignedBlockStyle, alignedImageStyle } from "../align";
import { blockStylesToCss } from "../styles";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderVideoBlock(block: VideoBlock, context: RenderContext) {
  const {
    thumbnailSrc,
    videoUrl,
    alt,
    width,
    borderRadius,
    align,
    playButtonColor,
    playLabel,
  } = block.props;

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align),
      }}
    >
      <Link href={videoUrl} style={{ textDecoration: "none", color: "inherit" }}>
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{
            ...alignedImageStyle(align),
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: 0, lineHeight: 0 }}>
                <Img
                  src={thumbnailSrc}
                  alt={alt ?? "Video thumbnail"}
                  width={width === "100%" ? undefined : width}
                  style={{
                    width: width === "100%" ? "100%" : width ? `${width}px` : "100%",
                    maxWidth: "100%",
                    borderRadius: borderRadius ? `${borderRadius}px` : undefined,
                    display: "block",
                  }}
                />
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style={{
                  backgroundColor: playButtonColor ?? "#111827",
                  padding: "10px 16px",
                  borderRadius: borderRadius
                    ? `0 0 ${borderRadius}px ${borderRadius}px`
                    : undefined,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 14,
                    fontFamily: context.settings.fontFamily,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {playLabel ?? "▶ Watch Video"}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Link>
    </Section>
  );
}

function renderVideoBlockText(block: VideoBlock): string {
  const label = block.props.playLabel ?? "Watch Video";
  return `${label}: ${block.props.videoUrl}`;
}

registerBlock("video", { html: renderVideoBlock, text: renderVideoBlockText });
