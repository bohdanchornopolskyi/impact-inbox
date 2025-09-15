import { Doc } from "@/convex/_generated/dataModel";

export const ROOT_CONTAINER_ID = "ROOT";

export type BorderSide = {
  width?: number;
  style?: "solid" | "dotted" | "dashed";
  color?: string;
};

export type Border = {
  // Global border properties (apply to all sides)
  width?: number;
  style?: "solid" | "dotted" | "dashed";
  color?: string;
  // Individual side properties
  top?: BorderSide;
  right?: BorderSide;
  bottom?: BorderSide;
  left?: BorderSide;
};

export type BorderRadius = {
  // Global radius (applies to all corners)
  radius?: number;
  // Individual corner properties
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
};

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
  border?: Border;
  borderRadius?: BorderRadius;

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

  // Divider/Spacer Specific (now handled by individual border sides above)

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
};

// --- Union of All Possible Block Types ---

export type AnyBlock =
  | TextBlockType
  | ButtonBlockType
  | ImageBlockType
  | ContainerBlockType;

export type BaseUiBlock = {
  id: string;
  name: string;
  parentId: string;
  styles: BlockStyles;
};

export type ContainerUiBlock = BaseUiBlock & {
  type: "container";
  children: AnyUiBlock[];
};

export type TextUiBlock = BaseUiBlock & { type: "text"; content: string };

export type ButtonUiBlock = BaseUiBlock & {
  type: "button";
  content: string;
  href: string;
};

export type ImageUiBlock = BaseUiBlock & {
  type: "image";
  src: string;
  alt: string;
  href?: string;
};

export type AnyUiBlock =
  | ContainerUiBlock
  | TextUiBlock
  | ButtonUiBlock
  | ImageUiBlock;

// --- Actions ---
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

export type SetInitialState = {
  type: "SET_INITIAL_STATE";
  payload: AnyBlock[];
};

export type HistoryAction =
  | AddBlockAction
  | UpdateStyleAction
  | UpdateContentAction
  | DeleteBlockAction
  | MoveBlockAction
  | SetInitialState;

type StyleKey =
  | keyof BlockStyles
  | "border.width"
  | "border.style"
  | "border.color"
  | "border.top.width"
  | "border.top.style"
  | "border.top.color"
  | "border.right.width"
  | "border.right.style"
  | "border.right.color"
  | "border.bottom.width"
  | "border.bottom.style"
  | "border.bottom.color"
  | "border.left.width"
  | "border.left.style"
  | "border.left.color"
  | "borderRadius.radius"
  | "borderRadius.topLeft"
  | "borderRadius.topRight"
  | "borderRadius.bottomLeft"
  | "borderRadius.bottomRight";

export type StyleField = {
  key: StyleKey;
  label: string;
  type: "number" | "text" | "color" | "checkbox" | "select";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
};

export type Snapshot = Doc<"templateSnapshots">;
