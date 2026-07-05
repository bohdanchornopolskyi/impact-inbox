import { resolveInsertionIndex, type CanvasDropTarget } from "./canvas-contract";

export type CanvasSiblingBounds = {
  id: string;
  start: number;
  end: number;
};

export function filterDraggedSiblingIds<T>(
  items: readonly T[],
  getId: (item: T) => string,
  excludeId: string | null | undefined,
): T[] {
  if (!excludeId) {
    return [...items];
  }

  return items.filter((item) => getId(item) !== excludeId);
}

export function resolveInsertionIndexExcludingSibling(
  pointerCoord: number,
  siblings: readonly CanvasSiblingBounds[],
  excludeId: string | null | undefined,
): number {
  const bounds = filterDraggedSiblingIds(siblings, (sibling) => sibling.id, excludeId).map(
    ({ start, end }) => ({ start, end }),
  );

  return resolveInsertionIndex(pointerCoord, bounds);
}

export function isDragKindValidForTargetKind(
  dragKind: string,
  target: CanvasDropTarget | null,
): boolean {
  if (!target) {
    return false;
  }

  switch (dragKind) {
    case "content":
      return target.kind === "column";
    case "section":
      return target.kind === "body";
    case "row":
      return target.kind === "section";
    case "column":
      return target.kind === "row";
    default:
      return false;
  }
}
