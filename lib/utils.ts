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

    // Individual side borders
    if (border.top) {
      if (border.top.width !== undefined)
        css.borderTopWidth = `${border.top.width}px`;
      if (border.top.style) css.borderTopStyle = border.top.style;
      if (border.top.color) css.borderTopColor = border.top.color;
    }
    if (border.right) {
      if (border.right.width !== undefined)
        css.borderRightWidth = `${border.right.width}px`;
      if (border.right.style) css.borderRightStyle = border.right.style;
      if (border.right.color) css.borderRightColor = border.right.color;
    }
    if (border.bottom) {
      if (border.bottom.width !== undefined)
        css.borderBottomWidth = `${border.bottom.width}px`;
      if (border.bottom.style) css.borderBottomStyle = border.bottom.style;
      if (border.bottom.color) css.borderBottomColor = border.bottom.color;
    }
    if (border.left) {
      if (border.left.width !== undefined)
        css.borderLeftWidth = `${border.left.width}px`;
      if (border.left.style) css.borderLeftStyle = border.left.style;
      if (border.left.color) css.borderLeftColor = border.left.color;
    }
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

  return css;
}
