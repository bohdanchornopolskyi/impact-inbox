import { Section } from "@react-email/components";
import type { CSSProperties } from "react";
import type { ShapeBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { registerBlock } from "./content-block-registry";

export function renderShapeBlock(block: ShapeBlock) {
  const { shape, color, width, height, borderRadius } = block.props;
  const fill = color ?? "#2563eb";

  if (shape === "triangle") {
    const triangleWidth = width ?? 80;
    const triangleHeight = height ?? 80;

    return (
      <Section key={block.id} style={blockStylesToCss(block.styles)}>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${triangleWidth / 2}px solid transparent`,
            borderRight: `${triangleWidth / 2}px solid transparent`,
            borderBottom: `${triangleHeight}px solid ${fill}`,
            display: "inline-block",
          }}
        />
      </Section>
    );
  }

  const shapeStyles: CSSProperties = {
    ...blockStylesToCss(block.styles),
    backgroundColor: fill,
    width: `${width ?? 80}px`,
    height: `${height ?? 80}px`,
    borderRadius:
      shape === "circle"
        ? "50%"
        : shape === "line"
          ? "0"
          : `${borderRadius ?? 0}px`,
    display: "inline-block",
  };

  if (shape === "line") {
    shapeStyles.height = `${height ?? 2}px`;
    shapeStyles.width = `${width ?? 120}px`;
  }

  return (
    <Section key={block.id}>
      <div style={shapeStyles} />
    </Section>
  );
}

function renderShapeBlockText(): string {
  return "";
}

registerBlock("shape", { html: renderShapeBlock, text: renderShapeBlockText });
