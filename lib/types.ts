import { Doc } from "../convex/_generated/dataModel";

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

export type BaseBlockStyles = {
  // Layout & Spacing
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  // Background
  backgroundColor?: string;

  // Borders
  border?: Border;
  borderRadius?: BorderRadius;
};

export type TypographyStyles = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  textDecoration?: "none" | "underline" | "line-through";
  textWrap?: "wrap" | "nowrap";
};

export type SizingStyles = {
  widthMode?: "fill" | "fixed";
  widthPx?: number;
  heightMode?: "fill" | "fixed";
  heightPx?: number;
  alignment?: "left" | "center" | "right";
};

export type LinkStyles = {
  linkColor?: string;
  linkUnderline?: boolean;
};

export type BlockStyles = BaseBlockStyles &
  TypographyStyles &
  SizingStyles &
  LinkStyles;

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
  styles: BaseBlockStyles & TypographyStyles & LinkStyles;
};

export type ButtonBlockType = BaseBlock & {
  type: "button";
  content: string;
  href: string;
  styles: BaseBlockStyles & TypographyStyles & SizingStyles;
};

export type ImageBlockType = BaseBlock & {
  type: "image";
  src: string;
  alt: string;
  href?: string;
  styles: BaseBlockStyles & SizingStyles;
};

export type ContainerBlockType = BaseBlock & {
  type: "container";
  styles: BaseBlockStyles;
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

export type TextUiBlock = BaseUiBlock & {
  type: "text";
  content: string;
  styles: BaseBlockStyles & TypographyStyles;
};

export type ButtonUiBlock = BaseUiBlock & {
  type: "button";
  content: string;
  href: string;
  styles: BaseBlockStyles & TypographyStyles & SizingStyles;
};

export type ImageUiBlock = BaseUiBlock & {
  type: "image";
  src: string;
  alt: string;
  href?: string;
  styles: BaseBlockStyles & SizingStyles;
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
