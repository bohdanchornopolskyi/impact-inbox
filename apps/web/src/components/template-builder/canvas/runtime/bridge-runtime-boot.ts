export function getCanvasBridgeBootRuntime(): string {
  return `
  function blockLinkFromTarget(target) {
    var element = resolveElement(target);
    if (!element) {
      return null;
    }
    var link = element.closest("a");
    if (!link || !link.closest("[data-block-id]")) {
      return null;
    }
    return link;
  }

  disableBlockLinks();

  document.addEventListener("pointerdown", onSelectedBlockPointerDown, true);

  window.addEventListener(
    "pointerup",
    function (event) {
      if (!dragPointer || event.pointerId !== dragPointer.pointerId) {
        return;
      }
      if (!dragPointer.captureEl.isConnected) {
        abortDragPointerSession();
      }
    },
    true,
  );

  document.addEventListener(
    "click",
    function (event) {
      if (suppressBlockClick) {
        suppressBlockClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (blockLinkFromTarget(event.target)) {
        event.preventDefault();
      }

      var clickedElement = resolveElement(event.target);

      if (editingElement) {
        if (clickedElement && editingElement.contains(clickedElement)) {
          return;
        }
        commitEdit();
      }

      if (!clickedElement) {
        return;
      }
      var block = clickedElement.closest("[data-block-id]");
      if (!block) {
        return;
      }
      var blockId = block.getAttribute("data-block-id");
      if (!blockId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage({ type: "block-select", blockId: blockId }, "*");
    },
    true,
  );

  document.addEventListener(
    "dblclick",
    function (event) {
      if (!canEdit || editingElement) {
        return;
      }

      var editable = findEditableTarget(event.target);
      if (!editable) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      var editableBlock = findEditableBlock(event.target);
      if (editableBlock && isRichtextEditableBlock(editableBlock)) {
        startRichtextEdit(editableBlock);
        return;
      }
      var target = editable;
      setTimeout(function () {
        startEdit(target);
      }, 0);
    },
    true,
  );

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) {
      return;
    }
    var data = event.data;
    if (!data) {
      return;
    }
    if (data.type === "select-block") {
      applySelection(data.blockId, data.label || null);
      return;
    }
    if (data.type === "canvas-prepare-drag") {
      commitEdit();
      return;
    }
    if (data.type === "canvas-cancel-drag") {
      abortDragPointerSession();
      clearDragSession();
      return;
    }
    if (data.type === "canvas-palette-drag-finish") {
      if (
        !canEdit ||
        !isDragSession ||
        !dragKind ||
        typeof data.clientX !== "number" ||
        typeof data.clientY !== "number"
      ) {
        clearDragSession();
        window.parent.postMessage(
          { type: "canvas-palette-drag-commit", target: null },
          "*",
        );
        return;
      }

      var paletteTarget = sanitizeTargetForDrag(
        resolveDropTargetForDrag(data.clientX, data.clientY),
      );
      clearDragSession();
      window.parent.postMessage(
        { type: "canvas-palette-drag-commit", target: paletteTarget },
        "*",
      );
      return;
    }
    if (data.type === "canvas-palette-drag-start") {
      if (!canEdit || !data.dragKind) {
        return;
      }
      abortDragPointerSession();
      commitEdit();
      setPaletteDragSessionActive(data.dragKind);
      if (
        typeof data.clientX === "number" &&
        typeof data.clientY === "number"
      ) {
        handlePointerAtDuringDrag(data.clientX, data.clientY);
      }
      return;
    }
    if (data.type === "canvas-palette-drag-move") {
      if (!isDragSession || dragPointer) {
        return;
      }
      if (
        typeof data.clientX !== "number" ||
        typeof data.clientY !== "number"
      ) {
        return;
      }
      handlePointerAtDuringDrag(data.clientX, data.clientY);
      return;
    }
    if (data.type === "canvas-palette-drag-end") {
      clearDragSession();
      return;
    }
    if (data.type === "richtext-format") {
      applyRichtextCommand(data.command, data.value, data.blockId);
      return;
    }
    if (data.type === "richtext-set-heading") {
      applyRichtextHeading(data.tag, data.blockId);
      return;
    }
    if (data.type === "richtext-commit") {
      commitEdit();
      return;
    }
    if (data.type === "richtext-cancel") {
      cancelEditing();
      return;
    }
    if (data.type === "update-preview" && typeof data.html === "string") {
      updatePreview(data.html);
      return;
    }
  });

  window.addEventListener("scroll", updatePositions, true);
  window.addEventListener("resize", updatePositions);

  document.addEventListener(
    "load",
    function (event) {
      if (event.target && event.target.tagName === "IMG") {
        updatePositions();
      }
    },
    true,
  );
`;
}
