import type { BlockStyles, Spacing } from "@repo/shared";
import type { CSSProperties } from "react";

function spacingToCss(spacing: Spacing): string {
  if (typeof spacing === "number") {
    return `${spacing}px`;
  }

  const top = spacing.top ?? 0;
  const right = spacing.right ?? top;
  const bottom = spacing.bottom ?? top;
  const left = spacing.left ?? right;

  return `${top}px ${right}px ${bottom}px ${left}px`;
}

export function blockStylesToCss(styles?: BlockStyles): CSSProperties {
  if (!styles) {
    return {};
  }

  const css: CSSProperties = {};

  if (styles.padding !== undefined) {
    css.padding = spacingToCss(styles.padding);
  }

  if (styles.margin !== undefined) {
    css.margin = spacingToCss(styles.margin);
  }

  if (styles.backgroundColor !== undefined) {
    css.backgroundColor = styles.backgroundColor;
  }

  if (styles.borderRadius !== undefined) {
    css.borderRadius = `${styles.borderRadius}px`;
  }

  if (styles.borderWidth !== undefined) {
    css.borderWidth = `${styles.borderWidth}px`;
  }

  if (styles.borderColor !== undefined) {
    css.borderColor = styles.borderColor;
  }

  if (styles.borderStyle !== undefined) {
    css.borderStyle = styles.borderStyle;
  }

  if (styles.textAlign !== undefined) {
    css.textAlign = styles.textAlign;
  }

  if (styles.width !== undefined) {
    css.width = typeof styles.width === "number" ? `${styles.width}px` : styles.width;
  }

  if (styles.height !== undefined) {
    css.height = `${styles.height}px`;
  }

  if (styles.verticalAlign !== undefined) {
    css.verticalAlign = styles.verticalAlign;
  }

  if (styles.letterSpacing !== undefined) {
    css.letterSpacing = `${styles.letterSpacing}px`;
  }

  return css;
}
