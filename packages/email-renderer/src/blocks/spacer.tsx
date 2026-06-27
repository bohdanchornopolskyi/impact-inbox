import { Section } from "@react-email/components";
import type { SpacerBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { registerBlock } from "./content-block-registry";

export function renderSpacerBlock(block: SpacerBlock) {
  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        height: `${block.props.height}px`,
        lineHeight: `${block.props.height}px`,
        fontSize: "1px",
      }}
    >
      &nbsp;
    </Section>
  );
}

function renderSpacerBlockText(): string {
  return "";
}

registerBlock("spacer", { html: renderSpacerBlock, text: renderSpacerBlockText });
