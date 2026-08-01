import type { Spacing } from "../schemas/template/styles";

export type SpacingSides = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const SPACING_SIDES = ["top", "right", "bottom", "left"] as const;

export type SpacingSide = (typeof SPACING_SIDES)[number];

/**
 * Expands a spacing value into the four sides the renderer will actually emit,
 * following CSS shorthand fallbacks. The inspector resolves the same way so a
 * field never reads blank while the block renders with spacing.
 */
export function resolveSpacingSides(spacing?: Spacing): SpacingSides {
  if (spacing === undefined) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  if (typeof spacing === "number") {
    return { top: spacing, right: spacing, bottom: spacing, left: spacing };
  }

  const top = spacing.top ?? 0;
  const right = spacing.right ?? top;
  const bottom = spacing.bottom ?? top;
  const left = spacing.left ?? right;

  return { top, right, bottom, left };
}

/** `undefined` when every side is 0, so cleared spacing drops out of styles. */
export function spacingFromSides(sides: SpacingSides): Spacing | undefined {
  if (SPACING_SIDES.every((side) => sides[side] === 0)) {
    return undefined;
  }

  const { top, right, bottom, left } = sides;

  if (top === right && right === bottom && bottom === left) {
    return top;
  }

  return sides;
}
