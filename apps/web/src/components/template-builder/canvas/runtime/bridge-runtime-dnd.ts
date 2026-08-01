export function getCanvasBridgeDndRuntime(): string {
  return `
  function getVerticalBounds(elements) {
    var bounds = [];
    for (var i = 0; i < elements.length; i += 1) {
      var rect = elements[i].getBoundingClientRect();
      bounds.push({ start: rect.top, end: rect.bottom });
    }
    return bounds;
  }

  function getHorizontalBounds(elements) {
    var bounds = [];
    for (var i = 0; i < elements.length; i += 1) {
      var rect = elements[i].getBoundingClientRect();
      bounds.push({ start: rect.left, end: rect.right });
    }
    return bounds;
  }

  function getContentBlocksInColumn(columnEl) {
    var blocks = [];
    var children = columnEl.children;
    for (var i = 0; i < children.length; i += 1) {
      var child = children[i];
      if (
        child.hasAttribute("data-block-id") &&
        !child.hasAttribute("data-layout-role")
      ) {
        blocks.push(child);
      }
    }
    return blocks;
  }

  function getSectionsInBody() {
    var body = document.querySelector("[data-canvas-body]");
    if (!body) {
      return [];
    }
    return Array.prototype.slice.call(
      body.querySelectorAll('[data-layout-role="section"]'),
    );
  }

  function getRowsInSection(sectionEl) {
    return Array.prototype.slice.call(
      sectionEl.querySelectorAll('[data-layout-role="row"]'),
    );
  }

  function getColumnsInRow(rowEl) {
    return Array.prototype.slice.call(
      rowEl.querySelectorAll('[data-layout-role="column"]'),
    );
  }

  function dropTargetsEqual(left, right) {
    if (left === right) {
      return true;
    }
    if (!left || !right) {
      return false;
    }
    if (left.kind !== right.kind || left.index !== right.index) {
      return false;
    }
    if (left.kind === "body") {
      return right.kind === "body";
    }
    if (left.kind === "section") {
      return right.kind === "section" && right.sectionId === left.sectionId;
    }
    if (left.kind === "row") {
      return right.kind === "row" && right.rowId === left.rowId;
    }
    if (left.kind === "column") {
      return right.kind === "column" && right.columnId === left.columnId;
    }
    return false;
  }

  function resolveColumnContentTarget(columnEl, clientY, excludeBlockId) {
    var columnId = columnEl.getAttribute("data-block-id");
    if (!columnId) {
      return null;
    }
    var contentBlocks = getContentBlocksInColumn(columnEl);
    if (contentBlocks.length === 0) {
      return { kind: "column", columnId: columnId, index: 0 };
    }
    var siblings = [];
    for (var i = 0; i < contentBlocks.length; i += 1) {
      var blockEl = contentBlocks[i];
      var rect = blockEl.getBoundingClientRect();
      siblings.push({
        id: blockEl.getAttribute("data-block-id") || "",
        start: rect.top,
        end: rect.bottom,
      });
    }
    var index = resolveInsertionIndexExcludingSibling(
      clientY,
      siblings,
      excludeBlockId,
    );
    return { kind: "column", columnId: columnId, index: index };
  }

  function resolveDropTarget(clientX, clientY) {
    var body = document.querySelector("[data-canvas-body]");
    if (!body) {
      return null;
    }

    var hit = document.elementFromPoint(clientX, clientY);
    if (!hit || !body.contains(hit)) {
      return null;
    }

    var contentBlock = hit.closest("[data-block-id]:not([data-layout-role])");
    if (contentBlock && body.contains(contentBlock)) {
      var contentColumn = contentBlock.closest('[data-layout-role="column"]');
      if (!contentColumn) {
        return null;
      }
      return resolveColumnContentTarget(contentColumn, clientY);
    }

    var column = hit.closest('[data-layout-role="column"]');
    if (column && body.contains(column)) {
      return resolveColumnContentTarget(column, clientY);
    }

    var row = hit.closest('[data-layout-role="row"]');
    if (row && body.contains(row)) {
      var rowId = row.getAttribute("data-block-id");
      if (!rowId) {
        return null;
      }
      var columns = getColumnsInRow(row);
      var columnIndex = resolveInsertionIndex(clientX, getHorizontalBounds(columns));
      return { kind: "row", rowId: rowId, index: columnIndex };
    }

    var section = hit.closest('[data-layout-role="section"]');
    if (section && body.contains(section)) {
      var sectionId = section.getAttribute("data-block-id");
      if (!sectionId) {
        return null;
      }
      var rows = getRowsInSection(section);
      var rowIndex = resolveInsertionIndex(clientY, getVerticalBounds(rows));
      return { kind: "section", sectionId: sectionId, index: rowIndex };
    }

    var sections = getSectionsInBody();
    if (sections.length === 0) {
      return { kind: "body", index: 0 };
    }
    var sectionIndex = resolveInsertionIndex(clientY, getVerticalBounds(sections));
    return { kind: "body", index: sectionIndex };
  }

  function sanitizeTargetForDrag(target) {
    if (target && dragKind && !isDragKindValidForTargetKind(dragKind, target)) {
      return null;
    }
    return target;
  }

  function notifyParentDropTarget(target, duringDrag) {
    var resolved = duringDrag ? sanitizeTargetForDrag(target) : target;

    if (!duringDrag) {
      if (dropTargetsEqual(activeDropTarget, resolved)) {
        return;
      }
      activeDropTarget = resolved;
    }

    window.parent.postMessage(
      {
        type: "canvas-drop-target",
        target: resolved,
        dragKind: duringDrag ? dragKind : null,
        dragBlockId: duringDrag ? dragBlockId : null,
      },
      "*",
    );
  }

  function clearDropTarget() {
    if (isDragSession && dragKind) {
      notifyParentDropTarget(null, true);
      return;
    }
    notifyParentDropTarget(null, false);
  }

  function ensureLayer() {
    if (layer) {
      return;
    }
    layer = document.createElement("div");
    layer.id = "canvas-bridge-layer";
    hoverFrame = document.createElement("div");
    hoverFrame.className = "canvas-bridge-frame canvas-bridge-hover";
    selectionFrame = document.createElement("div");
    selectionFrame.className = "canvas-bridge-frame canvas-bridge-selected";
    dropIndicator = document.createElement("div");
    dropIndicator.className = "canvas-bridge-drop-indicator";
    toolbar = document.createElement("div");
    toolbar.className = "canvas-bridge-toolbar";
    toolbarLabel = document.createElement("span");
    toolbarLabel.className = "canvas-bridge-label";
    toolbarActions = document.createElement("span");
    toolbarActions.className = "canvas-bridge-actions";
    toolbar.appendChild(toolbarLabel);
    toolbar.appendChild(toolbarActions);
    layer.appendChild(hoverFrame);
    layer.appendChild(selectionFrame);
    layer.appendChild(dropIndicator);
    layer.appendChild(toolbar);
    document.body.appendChild(layer);
  }

  function postDragCommit(blockId, target) {
    window.parent.postMessage(
      {
        type: "canvas-drag-commit",
        blockId: blockId,
        target: target,
      },
      "*",
    );
  }

  function detachDragPointerListeners(session) {
    var captureEl = session.captureEl;
    if (!captureEl || !session.onPointerMove) {
      return;
    }

    if (captureEl.hasPointerCapture(session.pointerId)) {
      captureEl.releasePointerCapture(session.pointerId);
    }

    captureEl.removeEventListener("pointermove", session.onPointerMove);
    captureEl.removeEventListener("pointerup", session.onPointerFinish);
    captureEl.removeEventListener("pointercancel", session.onPointerFinish);
  }

  function abortDragPointerSession() {
    if (!dragPointer) {
      return;
    }

    var session = dragPointer;
    detachDragPointerListeners(session);

    if (session.active) {
      postDragCommit(session.blockId, null);
      clearDragSession();
    }

    dragPointer = null;
  }

  function startDragPointerSession(captureEl, blockId, pointerId, startX, startY) {
    abortDragPointerSession();
    captureEl.setPointerCapture(pointerId);

    function onPointerMove(moveEvent) {
      if (!dragPointer || moveEvent.pointerId !== pointerId) {
        return;
      }

      if (!dragPointer.active) {
        var dx = moveEvent.clientX - startX;
        var dy = moveEvent.clientY - startY;
        if (Math.hypot(dx, dy) < dragActivationPx) {
          return;
        }

        commitEdit();
        dragPointer.active = true;
        setDragSessionActive(blockId);
        var block = findBlockElement(blockId);
        dragKind = block ? resolveDragKind(block) : "content";
        window.parent.postMessage(
          {
            type: "canvas-drag-active",
            blockId: blockId,
            dragKind: dragKind,
          },
          "*",
        );
      }

      handlePointerAtDuringDrag(moveEvent.clientX, moveEvent.clientY);
    }

    function onPointerFinish(endEvent) {
      if (!dragPointer || endEvent.pointerId !== pointerId) {
        return;
      }

      detachDragPointerListeners(dragPointer);

      if (dragPointer.active) {
        suppressBlockClick = true;
        var commitTarget = sanitizeTargetForDrag(
          resolveDropTargetForDrag(endEvent.clientX, endEvent.clientY),
        );
        postDragCommit(dragPointer.blockId, commitTarget);
        clearDragSession();
      }

      dragPointer = null;
      updatePositions();
    }

    dragPointer = {
      blockId: blockId,
      pointerId: pointerId,
      startX: startX,
      startY: startY,
      active: false,
      captureEl: captureEl,
      onPointerMove: onPointerMove,
      onPointerFinish: onPointerFinish,
    };

    window.parent.postMessage(
      {
        type: "canvas-drag-handle-down",
        blockId: blockId,
        clientX: startX,
        clientY: startY,
      },
      "*",
    );

    captureEl.addEventListener("pointermove", onPointerMove);
    captureEl.addEventListener("pointerup", onPointerFinish);
    captureEl.addEventListener("pointercancel", onPointerFinish);
  }

  function canStartCanvasDrag(event) {
    return (
      canEdit &&
      selectedBlockId &&
      !isDragSession &&
      !dragPointer &&
      !editingElement &&
      event.button === 0
    );
  }

  function onDragHandlePointerDown(event) {
    if (!canEdit || !selectedBlockId || isDragSession || dragPointer) {
      return;
    }

    if (editingElement) {
      commitEdit();
    }

    event.preventDefault();
    event.stopPropagation();
    startDragPointerSession(
      event.currentTarget,
      selectedBlockId,
      event.pointerId,
      event.clientX,
      event.clientY,
    );
  }

  function onSelectedBlockPointerDown(event) {
    if (!canStartCanvasDrag(event)) {
      return;
    }

    var target = resolveElement(event.target);
    if (!target || target.closest(".canvas-bridge-toolbar")) {
      return;
    }

    var block = target.closest("[data-block-id]");
    if (
      !block ||
      block.getAttribute("data-block-id") !== selectedBlockId ||
      isCanvasEditableBlock(block)
    ) {
      return;
    }

    startDragPointerSession(
      block,
      selectedBlockId,
      event.pointerId,
      event.clientX,
      event.clientY,
    );
  }

  function postBuilderShortcut(action) {
    window.parent.postMessage(
      { type: "builder-shortcut", action: action },
      "*",
    );
  }

  function createToolbarActionButton(label, svg, action) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "canvas-bridge-toolbar-btn";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = svg;
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      postBuilderShortcut(action);
    });
    return button;
  }

  function rebuildToolbarActions(block) {
    if (!toolbarActions) {
      return;
    }
    toolbarActions.innerHTML = "";
    if (!canEdit || !block) {
      return;
    }

    var dragButton = document.createElement("button");
    dragButton.type = "button";
    dragButton.className = "canvas-bridge-toolbar-btn canvas-bridge-drag-handle";
    dragButton.setAttribute("aria-label", "Move");
    dragButton.title = "Move";
    dragButton.innerHTML = dragHandleSvg;
    dragButton.addEventListener("pointerdown", onDragHandlePointerDown);

    toolbarActions.appendChild(dragButton);
    toolbarActions.appendChild(
      createToolbarActionButton("Duplicate", duplicateSvg, "duplicate"),
    );
    toolbarActions.appendChild(
      createToolbarActionButton("Delete", deleteSvg, "delete"),
    );
  }

  function resolveDragKind(block) {
    var role = block.getAttribute("data-layout-role");
    if (role === "section" || role === "row" || role === "column") {
      return role;
    }
    return "content";
  }

  function filterDraggedSibling(elements, excludeBlockId) {
    if (!excludeBlockId) {
      return elements;
    }
    return elements.filter(function (element) {
      return element.getAttribute("data-block-id") !== excludeBlockId;
    });
  }

  function resolveBodySectionTarget(clientY, excludeBlockId) {
    var sections = filterDraggedSibling(getSectionsInBody(), excludeBlockId);
    if (sections.length === 0) {
      return { kind: "body", index: 0 };
    }
    var index = resolveInsertionIndex(clientY, getVerticalBounds(sections));
    return { kind: "body", index: index };
  }

  function resolveSectionRowTarget(clientX, clientY, excludeBlockId) {
    var body = document.querySelector("[data-canvas-body]");
    if (!body) {
      return null;
    }

    var hit = document.elementFromPoint(clientX, clientY);
    if (!hit || !body.contains(hit)) {
      return null;
    }

    var section = hit.closest('[data-layout-role="section"]');
    if (!section || !body.contains(section)) {
      return null;
    }

    var sectionId = section.getAttribute("data-block-id");
    if (!sectionId) {
      return null;
    }

    var rows = filterDraggedSibling(getRowsInSection(section), excludeBlockId);
    var index = resolveInsertionIndex(clientY, getVerticalBounds(rows));
    return { kind: "section", sectionId: sectionId, index: index };
  }

  function resolveRowColumnTarget(clientX, clientY, excludeBlockId) {
    var body = document.querySelector("[data-canvas-body]");
    if (!body) {
      return null;
    }

    var hit = document.elementFromPoint(clientX, clientY);
    if (!hit || !body.contains(hit)) {
      return null;
    }

    var row = hit.closest('[data-layout-role="row"]');
    if (!row || !body.contains(row)) {
      return null;
    }

    var rowId = row.getAttribute("data-block-id");
    if (!rowId) {
      return null;
    }

    var columns = filterDraggedSibling(getColumnsInRow(row), excludeBlockId);
    var index = resolveInsertionIndex(clientX, getHorizontalBounds(columns));
    return { kind: "row", rowId: rowId, index: index };
  }

  function resolveColumnContentTargetForDrag(clientX, clientY, excludeBlockId) {
    var body = document.querySelector("[data-canvas-body]");
    if (!body) {
      return null;
    }

    var hit = document.elementFromPoint(clientX, clientY);
    if (!hit || !body.contains(hit)) {
      return null;
    }

    var contentBlock = hit.closest("[data-block-id]:not([data-layout-role])");
    if (contentBlock && body.contains(contentBlock)) {
      var contentColumn = contentBlock.closest('[data-layout-role="column"]');
      if (!contentColumn) {
        return null;
      }
      return resolveColumnContentTarget(contentColumn, clientY, excludeBlockId);
    }

    var column = hit.closest('[data-layout-role="column"]');
    if (column && body.contains(column)) {
      return resolveColumnContentTarget(column, clientY, excludeBlockId);
    }

    return null;
  }

  function hideDropIndicator() {
    if (!dropIndicator) {
      return;
    }
    dropIndicator.style.display = "none";
  }

  function positionDropIndicatorHorizontal(left, top, width) {
    if (!dropIndicator) {
      return;
    }
    dropIndicator.style.display = "block";
    dropIndicator.style.width = width + "px";
    dropIndicator.style.height = "2px";
    dropIndicator.style.top = top + "px";
    dropIndicator.style.left = left + "px";
  }

  function positionDropIndicatorVerticalBar(left, top, height) {
    if (!dropIndicator) {
      return;
    }
    dropIndicator.style.display = "block";
    dropIndicator.style.width = "2px";
    dropIndicator.style.height = height + "px";
    dropIndicator.style.top = top + "px";
    dropIndicator.style.left = left + "px";
  }

  function positionDropIndicator(left, top, width) {
    positionDropIndicatorHorizontal(left, top, width);
  }

  function showBodySectionDropIndicator(target, excludeBlockId) {
    var sections = filterDraggedSibling(getSectionsInBody(), excludeBlockId);
    if (sections.length === 0) {
      var body = document.querySelector("[data-canvas-body]");
      if (!body) {
        hideDropIndicator();
        return;
      }
      var bodyRect = body.getBoundingClientRect();
      positionDropIndicator(
        bodyRect.left + window.scrollX,
        bodyRect.top + window.scrollY,
        bodyRect.width,
      );
      return;
    }

    if (target.index >= sections.length) {
      var lastSection = sections[sections.length - 1];
      var lastRect = lastSection.getBoundingClientRect();
      positionDropIndicator(
        lastRect.left + window.scrollX,
        lastRect.bottom + window.scrollY,
        lastRect.width,
      );
      return;
    }

    var nextSection = sections[target.index];
    var nextRect = nextSection.getBoundingClientRect();
    positionDropIndicator(
      nextRect.left + window.scrollX,
      nextRect.top + window.scrollY - 1,
      nextRect.width,
    );
  }

  function showSectionRowDropIndicator(target, excludeBlockId) {
    var section = findBlockElement(target.sectionId);
    if (!section) {
      hideDropIndicator();
      return;
    }

    var rows = filterDraggedSibling(getRowsInSection(section), excludeBlockId);
    if (rows.length === 0) {
      var placeholder = section.querySelector("[data-canvas-empty-placeholder]");
      var anchor = placeholder || section;
      var sectionRect = anchor.getBoundingClientRect();
      positionDropIndicator(
        sectionRect.left + window.scrollX,
        sectionRect.top + window.scrollY + Math.max(0, sectionRect.height / 2 - 1),
        sectionRect.width,
      );
      return;
    }

    if (target.index >= rows.length) {
      var lastRow = rows[rows.length - 1];
      var lastRect = lastRow.getBoundingClientRect();
      positionDropIndicator(
        lastRect.left + window.scrollX,
        lastRect.bottom + window.scrollY,
        lastRect.width,
      );
      return;
    }

    var nextRow = rows[target.index];
    var nextRect = nextRow.getBoundingClientRect();
    positionDropIndicator(
      nextRect.left + window.scrollX,
      nextRect.top + window.scrollY - 1,
      nextRect.width,
    );
  }

  function showRowColumnDropIndicator(target, excludeBlockId) {
    var row = findBlockElement(target.rowId);
    if (!row) {
      hideDropIndicator();
      return;
    }

    var columns = filterDraggedSibling(getColumnsInRow(row), excludeBlockId);
    if (columns.length === 0) {
      var placeholder = row.querySelector("[data-canvas-empty-placeholder]");
      var anchor = placeholder || row;
      var rowRect = anchor.getBoundingClientRect();
      positionDropIndicatorVerticalBar(
        rowRect.left + window.scrollX + Math.max(0, rowRect.width / 2 - 1),
        rowRect.top + window.scrollY,
        rowRect.height,
      );
      return;
    }

    if (target.index >= columns.length) {
      var lastColumn = columns[columns.length - 1];
      var lastRect = lastColumn.getBoundingClientRect();
      positionDropIndicatorVerticalBar(
        lastRect.right + window.scrollX,
        lastRect.top + window.scrollY,
        lastRect.height,
      );
      return;
    }

    var nextColumn = columns[target.index];
    var nextRect = nextColumn.getBoundingClientRect();
    positionDropIndicatorVerticalBar(
      nextRect.left + window.scrollX - 1,
      nextRect.top + window.scrollY,
      nextRect.height,
    );
  }

  function showDropIndicator(target) {
    if (!target) {
      hideDropIndicator();
      return;
    }

    if (target.kind === "column") {
      showColumnContentDropIndicator(target, dragBlockId);
      return;
    }

    if (target.kind === "body") {
      showBodySectionDropIndicator(target, dragBlockId);
      return;
    }

    if (target.kind === "section") {
      showSectionRowDropIndicator(target, dragBlockId);
      return;
    }

    if (target.kind === "row") {
      showRowColumnDropIndicator(target, dragBlockId);
    }
  }

  function showColumnContentDropIndicator(target, excludeBlockId) {
    var column = findBlockElement(target.columnId);
    if (!column) {
      hideDropIndicator();
      return;
    }

    var blocks = filterDraggedSibling(getContentBlocksInColumn(column), excludeBlockId);
    if (blocks.length === 0) {
      var placeholder = column.querySelector("[data-canvas-empty-placeholder]");
      var anchor = placeholder || column;
      var rect = anchor.getBoundingClientRect();
      positionDropIndicator(
        rect.left + window.scrollX,
        rect.top + window.scrollY + Math.max(0, rect.height / 2 - 1),
        rect.width,
      );
      return;
    }

    if (target.index >= blocks.length) {
      var lastBlock = blocks[blocks.length - 1];
      var lastRect = lastBlock.getBoundingClientRect();
      positionDropIndicator(
        lastRect.left + window.scrollX,
        lastRect.bottom + window.scrollY,
        lastRect.width,
      );
      return;
    }

    var nextBlock = blocks[target.index];
    var nextRect = nextBlock.getBoundingClientRect();
    positionDropIndicator(
      nextRect.left + window.scrollX,
      nextRect.top + window.scrollY - 1,
      nextRect.width,
    );
  }

  function setPaletteDragSessionActive(kind) {
    isDragSession = true;
    dragBlockId = null;
    dragKind = kind;
    clearHover();
    hideToolbar();
    ensureLayer();
    document.documentElement.classList.add("palette-drag-active");
  }

  function setDragSessionActive(blockId) {
    isDragSession = true;
    dragBlockId = blockId;
    clearHover();
    var block = findBlockElement(blockId);
    if (block) {
      block.classList.add("canvas-bridge-dragging");
    }
  }

  function clearDragSession() {
    document.documentElement.classList.remove("palette-drag-active");
    if (dragBlockId) {
      var block = findBlockElement(dragBlockId);
      if (block) {
        block.classList.remove("canvas-bridge-dragging");
      }
    }
    isDragSession = false;
    dragBlockId = null;
    dragKind = null;
    dragPointer = null;
    hideDropIndicator();
    clearDropTarget();
  }

  function resolveDropTargetForDrag(clientX, clientY) {
    if (!dragKind) {
      return null;
    }

    var excludeBlockId = dragBlockId || null;

    if (dragKind === "content") {
      return resolveColumnContentTargetForDrag(clientX, clientY, excludeBlockId);
    }

    if (dragKind === "section") {
      return resolveBodySectionTarget(clientY, excludeBlockId);
    }

    if (dragKind === "row") {
      return resolveSectionRowTarget(clientX, clientY, excludeBlockId);
    }

    if (dragKind === "column") {
      return resolveRowColumnTarget(clientX, clientY, excludeBlockId);
    }

    return null;
  }

  function handlePointerAtDuringDrag(x, y) {
    ensureLayer();
    window.parent.postMessage(
      { type: "canvas-drag-pointer", clientY: y },
      "*",
    );
    var target = sanitizeTargetForDrag(resolveDropTargetForDrag(x, y));
    if (target) {
      activeDropTarget = target;
      showDropIndicator(target);
    } else {
      activeDropTarget = null;
      hideDropIndicator();
    }
    notifyParentDropTarget(target, true);
  }
`;
}
