import { TEMPLATE_DEFAULT_COLORS, type RichtextBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { editableRichtext } from "./block-utils";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderRichtextBlock(block: RichtextBlock, context: RenderContext) {
  const { html, color, fontSize, lineHeight } = block.props;

  return (
    <div
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        color:
          color ?? context.settings.textColor ?? TEMPLATE_DEFAULT_COLORS.text,
        fontSize: fontSize ?? context.settings.fontSize ?? 16,
        lineHeight: lineHeight ?? context.settings.lineHeight ?? 1.5,
        fontFamily: context.settings.fontFamily,
        fontWeight: 400,
        margin: 0,
      }}
    >
      {editableRichtext(html)}
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function renderRichtextBlockText(block: RichtextBlock): string {
  return stripHtml(block.props.html);
}

registerBlock("richtext", { html: renderRichtextBlock, text: renderRichtextBlockText });
