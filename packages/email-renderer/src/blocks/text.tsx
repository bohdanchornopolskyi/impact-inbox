import { Text } from "@react-email/components";
import { TEMPLATE_DEFAULT_COLORS, type TextBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { editableText } from "./block-utils";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderTextBlock(block: TextBlock, context: RenderContext) {
  const { text, color, fontSize, fontWeight, lineHeight, textTransform } = block.props;

  return (
    <Text
      key={block.id}
      style={{
        margin: 0,
        ...blockStylesToCss(block.styles),
        color:
          color ?? context.settings.textColor ?? TEMPLATE_DEFAULT_COLORS.text,
        fontSize: fontSize ?? context.settings.fontSize ?? 16,
        fontWeight: fontWeight ?? undefined,
        lineHeight: lineHeight ?? context.settings.lineHeight ?? 1.5,
        textTransform: textTransform ?? undefined,
        fontFamily: context.settings.fontFamily,
      }}
    >
      {editableText(text)}
    </Text>
  );
}

function renderTextBlockText(block: TextBlock): string {
  return block.props.text;
}

registerBlock("text", { html: renderTextBlock, text: renderTextBlockText });
