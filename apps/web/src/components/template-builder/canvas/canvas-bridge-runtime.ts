export function getCanvasBridgeDropTargetRuntime(): string {
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
