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

export type CanvasRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

/** 0 when the point is inside the rect, else the gap to its nearest edge. */
export function distanceToRect(
  rect: CanvasRect,
  clientX: number,
  clientY: number,
): number {
  const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
  const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Index of the rect closest to the point, or -1 when there are none. Lets a drop
 * land in the container the pointer obviously means when it is over empty canvas
 * — below the last section, say — instead of resolving to no target at all.
 */
export function nearestRectIndex(
  rects: readonly CanvasRect[],
  clientX: number,
  clientY: number,
): number {
  let bestIndex = -1;
  let bestDistance = Infinity;

  for (const [index, rect] of rects.entries()) {
    if (rect.right === rect.left && rect.bottom === rect.top) {
      continue;
    }

    const distance = distanceToRect(rect, clientX, clientY);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
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

function distanceToRect(rect, clientX, clientY) {
  var dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
  var dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

function nearestRectIndex(rects, clientX, clientY) {
  var bestIndex = -1;
  var bestDistance = Infinity;
  for (var i = 0; i < rects.length; i += 1) {
    var rect = rects[i];
    if (rect.right === rect.left && rect.bottom === rect.top) {
      continue;
    }
    var distance = distanceToRect(rect, clientX, clientY);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function nearestElement(elements, clientX, clientY) {
  var rects = [];
  for (var i = 0; i < elements.length; i += 1) {
    rects.push(elements[i].getBoundingClientRect());
  }
  var index = nearestRectIndex(rects, clientX, clientY);
  return index >= 0 ? elements[index] : null;
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
