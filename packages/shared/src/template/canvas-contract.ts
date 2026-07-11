import type { ContentBlockType } from "../schemas/template/blocks/content";
import { LAYOUT_BLOCK_TYPES } from "../constants/template";

export const CANVAS_BLOCK_ID_ATTR = "data-block-id";
export const CANVAS_BLOCK_TYPE_ATTR = "data-block-type";
export const CANVAS_BLOCK_LABEL_ATTR = "data-block-label";
export const CANVAS_LAYOUT_ROLE_ATTR = "data-layout-role";
export const CANVAS_BODY_ATTR = "data-canvas-body";
export const CANVAS_EMPTY_COLUMN_ATTR = "data-empty-column";
export const CANVAS_EMPTY_SECTION_ATTR = "data-empty-section";
export const CANVAS_EMPTY_ROW_ATTR = "data-empty-row";
export const CANVAS_EMPTY_PLACEHOLDER_ATTR = "data-canvas-empty-placeholder";
export const CANVAS_EDITABLE_ATTR = "data-editable";
export const CANVAS_EDITABLE_PROP_ATTR = "data-editable-prop";
export const CANVAS_EDITABLE_KIND_ATTR = "data-editable-kind";

export type CanvasLayoutRole = (typeof LAYOUT_BLOCK_TYPES)[number];

export type CanvasDropTarget =
  | { kind: "body"; index: number }
  | { kind: "section"; sectionId: string; index: number }
  | { kind: "row"; rowId: string; index: number }
  | { kind: "column"; columnId: string; index: number };

export const CANVAS_DRAG_ACTIVATION_PX = 5;

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

export function resolveInsertionIndex(
  pointerCoord: number,
  siblingBounds: ReadonlyArray<{ start: number; end: number }>,
): number {
  for (let index = 0; index < siblingBounds.length; index += 1) {
    const bounds = siblingBounds[index]!;
    const midpoint = (bounds.start + bounds.end) / 2;
    if (pointerCoord < midpoint) {
      return index;
    }
  }

  return siblingBounds.length;
}

export function isColumnDropTarget(
  target: CanvasDropTarget | null,
): target is Extract<CanvasDropTarget, { kind: "column" }> {
  return target?.kind === "column";
}

export function isBodyDropTarget(
  target: CanvasDropTarget | null,
): target is Extract<CanvasDropTarget, { kind: "body" }> {
  return target?.kind === "body";
}

export function isSectionDropTarget(
  target: CanvasDropTarget | null,
): target is Extract<CanvasDropTarget, { kind: "section" }> {
  return target?.kind === "section";
}

export function isRowDropTarget(
  target: CanvasDropTarget | null,
): target is Extract<CanvasDropTarget, { kind: "row" }> {
  return target?.kind === "row";
}

export function isCanvasDropTarget(value: unknown): value is CanvasDropTarget {
  if (!value || typeof value !== "object") {
    return false;
  }

  const target = value as Record<string, unknown>;
  if (typeof target.index !== "number") {
    return false;
  }

  switch (target.kind) {
    case "body":
      return true;
    case "section":
      return typeof target.sectionId === "string";
    case "row":
      return typeof target.rowId === "string";
    case "column":
      return typeof target.columnId === "string";
    default:
      return false;
  }
}

export function canvasDropTargetsEqual(
  left: CanvasDropTarget | null,
  right: CanvasDropTarget | null,
): boolean {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  if (left.kind !== right.kind || left.index !== right.index) {
    return false;
  }

  switch (left.kind) {
    case "body":
      return right.kind === "body";
    case "section":
      return right.kind === "section" && right.sectionId === left.sectionId;
    case "row":
      return right.kind === "row" && right.rowId === left.rowId;
    case "column":
      return right.kind === "column" && right.columnId === left.columnId;
    default: {
      const unreachable: never = left;
      return unreachable;
    }
  }
}
