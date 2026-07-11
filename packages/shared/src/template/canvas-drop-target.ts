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

export function getCanvasDropTargetRuntimeScript(): string {
  return `
function resolveInsertionIndex(pointerCoord, siblingBounds) {
  for (var i = 0; i < siblingBounds.length; i += 1) {
    var bounds = siblingBounds[i];
    var midpoint = (bounds.start + bounds.end) / 2;
    if (pointerCoord < midpoint) {
      return i;
    }
  }
  return siblingBounds.length;
}

function filterDraggedSiblingIds(items, getId, excludeId) {
  if (!excludeId) {
    return items.slice();
  }
  var result = [];
  for (var i = 0; i < items.length; i += 1) {
    if (getId(items[i]) !== excludeId) {
      result.push(items[i]);
    }
  }
  return result;
}

function resolveInsertionIndexExcludingSibling(pointerCoord, siblings, excludeId) {
  var filtered = filterDraggedSiblingIds(siblings, function (sibling) {
    return sibling.id;
  }, excludeId);
  var bounds = [];
  for (var i = 0; i < filtered.length; i += 1) {
    bounds.push({ start: filtered[i].start, end: filtered[i].end });
  }
  return resolveInsertionIndex(pointerCoord, bounds);
}

function isDragKindValidForTargetKind(dragKind, target) {
  if (!target) {
    return false;
  }
  if (dragKind === "content") {
    return target.kind === "column";
  }
  if (dragKind === "section") {
    return target.kind === "body";
  }
  if (dragKind === "row") {
    return target.kind === "section";
  }
  if (dragKind === "column") {
    return target.kind === "row";
  }
  return false;
}
`.trim();
}
