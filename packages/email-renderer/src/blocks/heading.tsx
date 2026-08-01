import { Heading } from "@react-email/components";
import { TEMPLATE_DEFAULT_COLORS, type HeadingBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { editableText } from "./block-utils";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderHeadingBlock(block: HeadingBlock, context: RenderContext) {
  const { text, level, color, fontSize, fontWeight, lineHeight, textTransform } =
    block.props;
  const headingAs = {
    1: "h1",
    2: "h2",
    3: "h3",
    4: "h4",
    5: "h5",
    6: "h6",
  } as const;

  return (
    <Heading
      key={block.id}
      as={headingAs[level]}
      style={{
        margin: 0,
        ...blockStylesToCss(block.styles),
        color:
          color ??
          context.settings.textColor ??
          TEMPLATE_DEFAULT_COLORS.heading,
        fontSize: fontSize ?? undefined,
        fontWeight: fontWeight ?? undefined,
        lineHeight: lineHeight ?? context.settings.lineHeight,
        textTransform: textTransform ?? undefined,
        fontFamily: context.settings.fontFamily,
      }}
    >
      {editableText(text)}
    </Heading>
  );
}

function renderHeadingBlockText(block: HeadingBlock): string {
  return block.props.text;
}

registerBlock("heading", { html: renderHeadingBlock, text: renderHeadingBlockText });
