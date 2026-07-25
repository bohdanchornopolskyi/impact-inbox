import { Button, Section } from "@react-email/components";
import { TEMPLATE_DEFAULT_COLORS, type ButtonBlock } from "@repo/shared";
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
          backgroundColor:
            backgroundColor ??
            context.settings.linkColor ??
            TEMPLATE_DEFAULT_COLORS.buttonBackground,
          color: textColor ?? TEMPLATE_DEFAULT_COLORS.buttonText,
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
