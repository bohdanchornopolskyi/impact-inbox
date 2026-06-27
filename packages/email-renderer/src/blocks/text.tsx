import { Text } from "@react-email/components";
import type { TextBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { editableText } from "./block-utils";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderTextBlock(block: TextBlock, context: RenderContext) {
  const { text, color, fontSize, fontWeight, lineHeight, textTransform } = block.props;

  return (
    <Text
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        color: color ?? context.settings.textColor ?? "#333333",
        fontSize: fontSize ?? context.settings.fontSize ?? 16,
        fontWeight: fontWeight ?? undefined,
        lineHeight: lineHeight ?? context.settings.lineHeight ?? 1.5,
        textTransform: textTransform ?? undefined,
        fontFamily: context.settings.fontFamily,
        margin: 0,
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
