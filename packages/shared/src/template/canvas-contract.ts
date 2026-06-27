import type { ContentBlockType } from "../schemas/template/blocks/content";

export const CANVAS_BLOCK_ID_ATTR = "data-block-id";
export const CANVAS_BLOCK_TYPE_ATTR = "data-block-type";
export const CANVAS_BLOCK_LABEL_ATTR = "data-block-label";
export const CANVAS_EDITABLE_ATTR = "data-editable";
export const CANVAS_EDITABLE_PROP_ATTR = "data-editable-prop";
export const CANVAS_EDITABLE_KIND_ATTR = "data-editable-kind";

export type CanvasEditableKind = "plain" | "richtext";

export const CANVAS_PLAIN_TEXT_EDITABLE_TYPES = ["heading", "text"] as const satisfies readonly ContentBlockType[];

export const CANVAS_RICHTEXT_EDITABLE_TYPES = ["richtext"] as const satisfies readonly ContentBlockType[];

const plainTextEditableSet = new Set<string>(CANVAS_PLAIN_TEXT_EDITABLE_TYPES);
const richtextEditableSet = new Set<string>(CANVAS_RICHTEXT_EDITABLE_TYPES);

export function getCanvasEditableKind(
  type: ContentBlockType,
): CanvasEditableKind | null {
  if (plainTextEditableSet.has(type)) {
    return "plain";
  }
  if (richtextEditableSet.has(type)) {
    return "richtext";
  }
  return null;
}

export function isCanvasEditableBlockType(type: ContentBlockType): boolean {
  return getCanvasEditableKind(type) !== null;
}
