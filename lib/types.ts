export const ROOT_CONTAINER_ID = "ROOT";

export type BlockStyles = {
  // Layout & Spacing
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;

  // Background
  backgroundColor?: string;

  // Borders
  borderWidth?: number;
  borderStyle?: "solid" | "dotted" | "dashed";
  borderColor?: string;
  borderRadius?: number;

  // Typography
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  lineHeight?: number; // e.g., 1.5
  letterSpacing?: number;
  color?: string; // Text color
  textAlign?: "left" | "center" | "right";
  textDecoration?: "none" | "underline" | "line-through";
  textWrap?: "wrap" | "nowrap";

  // Link Specific
  linkColor?: string;
  linkUnderline?: boolean;

  // Sizing & Alignment (for Button/Image/Divider)
  widthMode?: "fill" | "fixed";
  widthPx?: number; // Only used if widthMode is 'fixed'
  heightMode?: "fill" | "fixed";
  heightPx?: number; // Only used if heightMode is 'fixed'
  alignment?: "left" | "center" | "right";

  // Divider/Spacer Specific
  borderTopWidth?: number; // Divider thickness
  borderTopStyle?: "solid" | "dotted" | "dashed";
  borderTopColor?: string;

  // List-specific styles
  listType?: "unordered" | "ordered";
  listStyleType?:
    | "disc"
    | "circle"
    | "square"
    | "decimal"
    | "lower-alpha"
    | "upper-alpha"
    | "lower-roman"
    | "upper-roman";
  itemSpacing?: number;
  markerColor?: string;
};

// Base properties common to all blocks
export type BaseBlock = {
  id: string;
  name: string;
  parentId: string;
  styles: BlockStyles;
};

// --- Block Type Definitions ---

export type TextBlockType = BaseBlock & {
  type: "text";
  content: string;
};

export type ButtonBlockType = BaseBlock & {
  type: "button";
  content: string;
  href: string;
};

export type ImageBlockType = BaseBlock & {
  type: "image";
  src: string;
  alt: string;
  href?: string;
};

export type ListBlockType = BaseBlock & {
  type: "list";
  items: string[];
};

export type ContainerBlockType = BaseBlock & {
  type: "container";
  children?: AnyBlock[];
};

// --- Union of All Possible Block Types ---

export type AnyBlock =
  | TextBlockType
  | ButtonBlockType
  | ImageBlockType
  | ContainerBlockType;

export type AddBlockAction = {
  type: "ADD_BLOCK";
  payload: {
    block: AnyBlock;
    parentId: string;
    index: number;
  };
};

export type UpdateStyleAction = {
  type: "UPDATE_STYLE";
  payload: {
    blockId: string;
    styles: Partial<BlockStyles>;
  };
};

export type UpdateContentAction = {
  type: "UPDATE_CONTENT";
  payload: {
    blockId: string;
    content:
      | Partial<Pick<TextBlockType, "content">>
      | Partial<Pick<ButtonBlockType, "content" | "href">>
      | Partial<Pick<ImageBlockType, "src" | "alt" | "href">>;
    // | Partial<Pick<ListBlockType, "items">>;
  };
};

export type DeleteBlockAction = {
  type: "DELETE_BLOCK";
  payload: {
    blockId: string;
  };
};

export type MoveBlockAction = {
  type: "MOVE_BLOCK";
  payload: {
    blockId: string;
    newParentId: string;
    newIndex: number;
  };
};

export type HistoryAction =
  | AddBlockAction
  | UpdateStyleAction
  | UpdateContentAction
  | DeleteBlockAction
  | MoveBlockAction;
