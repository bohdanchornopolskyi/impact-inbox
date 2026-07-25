import { Hr } from "@react-email/components";
import { TEMPLATE_DEFAULT_COLORS, type DividerBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { registerBlock } from "./content-block-registry";

export function renderDividerBlock(block: DividerBlock) {
  const { color, thickness, style, width } = block.props;

  return (
    <Hr
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        borderColor: color ?? TEMPLATE_DEFAULT_COLORS.divider,
        borderWidth: `${thickness ?? 1}px`,
        borderStyle: style ?? "solid",
        width: typeof width === "number" ? `${width}px` : width ?? "100%",
        margin: 0,
      }}
    />
  );
}

function renderDividerBlockText(): string {
  return "---";
}

registerBlock("divider", { html: renderDividerBlock, text: renderDividerBlockText });
