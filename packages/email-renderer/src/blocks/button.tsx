import { Button, Section } from "@react-email/components";
import type { ButtonBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderButtonBlock(block: ButtonBlock, context: RenderContext) {
  const {
    text,
    href,
    backgroundColor,
    textColor,
    borderRadius,
    borderWidth,
    borderColor,
    fontSize,
    fullWidth,
    paddingX,
    paddingY,
  } = block.props;

  return (
    <Section key={block.id} style={blockStylesToCss(block.styles)}>
      <Button
        href={href}
        style={{
          backgroundColor: backgroundColor ?? context.settings.linkColor ?? "#2563eb",
          color: textColor ?? "#ffffff",
          borderRadius: `${borderRadius ?? 6}px`,
          borderWidth: borderWidth ?? 0,
          borderColor: borderColor ?? "transparent",
          borderStyle: "solid",
          fontSize: fontSize ?? 16,
          fontFamily: context.settings.fontFamily,
          padding: `${paddingY ?? 12}px ${paddingX ?? 24}px`,
          display: fullWidth ? "block" : "inline-block",
          width: fullWidth ? "100%" : undefined,
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {text}
      </Button>
    </Section>
  );
}

function renderButtonBlockText(block: ButtonBlock): string {
  return `${block.props.text}: ${block.props.href}`;
}

registerBlock("button", { html: renderButtonBlock, text: renderButtonBlockText });
