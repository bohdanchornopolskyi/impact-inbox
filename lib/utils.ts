import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AnyBlock,
  AnyUiBlock,
  ROOT_CONTAINER_ID,
  Border,
  BorderRadius,
  BlockStyles,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildLayerTree(flatBlocks: AnyBlock[]): AnyUiBlock[] {
  const tree: AnyUiBlock[] = [];
  const blockMap = new Map<string, AnyUiBlock>();

  for (const block of flatBlocks) {
    blockMap.set(block.id, {
      ...block,
      ...(block.type === "container" && { children: [] }),
    } as AnyUiBlock);
  }

  for (const block of flatBlocks) {
    const blockFromMap = blockMap.get(block.id)!;

    if (block.parentId === ROOT_CONTAINER_ID) {
      tree.push(blockFromMap);
    } else {
      const parentFromMap = blockMap.get(block.parentId);
      if (parentFromMap?.type === "container") {
        parentFromMap.children!.push(blockFromMap);
      }
    }
  }

  return tree;
}

export function convertComplexStylesToCSS(styles: BlockStyles) {
  const css: React.CSSProperties = {};

  // Handle border
  if (styles.border) {
    const border = styles.border as Border;

    // Global border properties
    if (border.width !== undefined) css.borderWidth = `${border.width}px`;
    if (border.style) css.borderStyle = border.style;
    if (border.color) css.borderColor = border.color;

    // Individual side borders - inherit from global if not set individually
    const sides = [
      { side: "top", cssProp: "borderTop" },
      { side: "right", cssProp: "borderRight" },
      { side: "bottom", cssProp: "borderBottom" },
      { side: "left", cssProp: "borderLeft" },
    ] as const;

    sides.forEach(({ side, cssProp }) => {
      const sideBorder = border[side];

      // Use individual side values if they exist, otherwise fall back to global values
      const width =
        sideBorder?.width !== undefined ? sideBorder.width : border.width;
      const style = sideBorder?.style || border.style;
      const color = sideBorder?.color || border.color;

      if (width !== undefined) css[`${cssProp}Width`] = `${width}px`;
      if (style) css[`${cssProp}Style`] = style;
      if (color) css[`${cssProp}Color`] = color;
    });
  }

  // Handle border radius
  if (styles.borderRadius) {
    const borderRadius = styles.borderRadius as BorderRadius;

    if (borderRadius.radius !== undefined) {
      css.borderRadius = `${borderRadius.radius}px`;
    } else {
      // Individual corner properties
      const corners = [];
      if (borderRadius.topLeft !== undefined)
        corners[0] = `${borderRadius.topLeft}px`;
      if (borderRadius.topRight !== undefined)
        corners[1] = `${borderRadius.topRight}px`;
      if (borderRadius.bottomRight !== undefined)
        corners[2] = `${borderRadius.bottomRight}px`;
      if (borderRadius.bottomLeft !== undefined)
        corners[3] = `${borderRadius.bottomLeft}px`;

      if (corners.length > 0) {
        css.borderRadius = corners.join(" ");
      }
    }
  }

  // Handle alignment
  if (styles.alignment) {
    css.textAlign = styles.alignment;
  }

  return css;
}

export function syncBorderProperties(border: Border): Border {
  const syncedBorder = { ...border };

  // If global properties are set, ensure they're applied to individual sides
  if (border.width !== undefined || border.style || border.color) {
    const sides = ["top", "right", "bottom", "left"] as const;

    sides.forEach((side) => {
      if (!syncedBorder[side]) {
        syncedBorder[side] = {};
      }

      // Always update individual side properties with global values when syncing
      if (border.width !== undefined) {
        syncedBorder[side]!.width = border.width;
      }
      if (border.style) {
        syncedBorder[side]!.style = border.style;
      }
      if (border.color) {
        syncedBorder[side]!.color = border.color;
      }
    });
  }

  return syncedBorder;
}

export function getAlignmentClasses(alignment?: string, widthMode?: string) {
  if (widthMode === "fixed") {
    switch (alignment) {
      case "left":
        return "flex justify-start items-center";
      case "center":
        return "flex justify-center items-center";
      case "right":
        return "flex justify-end items-center";
      default:
        return "flex justify-center items-center";
    }
  }
  return "flex justify-center items-center";
}
