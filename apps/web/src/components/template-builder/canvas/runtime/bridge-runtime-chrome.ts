export function getCanvasBridgeChromeRuntime(): string {
  return `
  function hideFrame(frame) {
    frame.style.display = "none";
  }

  function hideToolbar() {
    toolbar.style.display = "none";
  }

  function positionFrame(frame, element) {
    var rect = element.getBoundingClientRect();
    frame.style.display = "block";
    frame.style.top = rect.top + window.scrollY + "px";
    frame.style.left = rect.left + window.scrollX + "px";
    frame.style.width = rect.width + "px";
    frame.style.height = rect.height + "px";
  }

  function resolveBlockLabel(element) {
    var block = element.closest("[data-block-id]");
    return block ? block.getAttribute("data-block-label") || "" : "";
  }

  function resolveLabel(element, label) {
    if (label) {
      return label;
    }
    return element.getAttribute("data-block-label") || resolveBlockLabel(element);
  }

  function positionToolbar(element, label) {
    if (!toolbar || !toolbarLabel) {
      return;
    }

    if (dragPointer || isDragSession) {
      return;
    }

    var resolvedLabel = resolveLabel(element, label);
    toolbarLabel.textContent = resolvedLabel;
    rebuildToolbarActions(element);

    if (!resolvedLabel && toolbarActions.childElementCount === 0) {
      hideToolbar();
      return;
    }

    var rect = element.getBoundingClientRect();
    toolbar.style.display = "flex";
    toolbar.style.visibility = "hidden";
    toolbar.style.top = "0px";
    toolbar.style.left = "0px";
    var toolbarWidth = toolbar.offsetWidth;
    var toolbarHeight = toolbar.offsetHeight;
    toolbar.style.visibility = "visible";

    var gap = 4;
    var top = rect.top + window.scrollY - toolbarHeight - gap;
    var left = rect.right + window.scrollX - toolbarWidth;

    if (top < window.scrollY) {
      toolbar.classList.add("canvas-bridge-toolbar-below");
      top = rect.bottom + window.scrollY + gap;
    } else {
      toolbar.classList.remove("canvas-bridge-toolbar-below");
    }

    left = Math.max(rect.left + window.scrollX, left);

    var body = document.querySelector("[data-canvas-body]");
    if (body) {
      var bodyRect = body.getBoundingClientRect();
      var minLeft = bodyRect.left + window.scrollX;
      var maxLeft = bodyRect.right + window.scrollX - toolbarWidth;
      left = Math.max(minLeft, Math.min(left, maxLeft));
    }

    toolbar.style.top = top + "px";
    toolbar.style.left = left + "px";
  }

  function findBlockElement(blockId) {
    if (!blockId) {
      return null;
    }
    return document.querySelector('[data-block-id="' + blockId + '"]');
  }

  function updatePositions() {
    if (hoveredBlock && hoveredBlock.getAttribute("data-block-id") !== selectedBlockId) {
      positionFrame(hoverFrame, resolveChromeElement(hoveredBlock));
    } else {
      hideFrame(hoverFrame);
    }

    if (!selectedBlockId) {
      hideFrame(selectionFrame);
      hideToolbar();
      return;
    }

    var selected = findBlockElement(selectedBlockId);
    if (!selected) {
      hideFrame(selectionFrame);
      hideToolbar();
      return;
    }

    positionFrame(selectionFrame, resolveChromeElement(selected));
    positionToolbar(
      resolveChromeElement(selected),
      toolbarLabel ? toolbarLabel.textContent || null : null,
    );
  }

  function observeSelectedBlock(element) {
    if (!window.ResizeObserver) {
      return;
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    resizeObserver = new ResizeObserver(function () {
      updatePositions();
    });
    resizeObserver.observe(element);
  }

  function clearHover() {
    hoveredBlock = null;
    hideFrame(hoverFrame);
  }

  function setHover(element) {
    if (!element) {
      clearHover();
      return;
    }
    var blockId = element.getAttribute("data-block-id");
    if (!blockId || blockId === selectedBlockId) {
      clearHover();
      return;
    }
    hoveredBlock = element;
    ensureLayer();
    positionFrame(hoverFrame, resolveChromeElement(element));
  }

  function applySelection(blockId, label) {
    if (blockId !== selectedBlockId && editingElement) {
      commitEdit();
    }

    if (dragPointer && blockId !== dragPointer.blockId) {
      abortDragPointerSession();
    }

    selectedBlockId = blockId;
    ensureLayer();

    if (!blockId) {
      hideFrame(selectionFrame);
      hideToolbar();
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      updatePositions();
      return;
    }

    var target = findBlockElement(blockId);
    if (!target) {
      hideFrame(selectionFrame);
      hideToolbar();
      updatePositions();
      return;
    }

    if (hoveredBlock && hoveredBlock.getAttribute("data-block-id") === blockId) {
      clearHover();
    }

    var chrome = resolveChromeElement(target);
    positionFrame(selectionFrame, chrome);
    positionToolbar(chrome, label || null);
    observeSelectedBlock(chrome);
    reportRichtextFormatStateForBlock(blockId);
  }

  document.addEventListener(
    "mouseover",
    function (event) {
      var element = resolveElement(event.target);
      if (!element) {
        clearHover();
        return;
      }
      var block = element.closest("[data-block-id]");
      if (!block) {
        clearHover();
        return;
      }
      setHover(block);
    },
    true,
  );

  document.addEventListener(
    "mousemove",
    function (event) {
      if (isDragSession || editingElement) {
        if (editingElement) {
          clearDropTarget();
        }
        return;
      }
      notifyParentDropTarget(resolveDropTarget(event.clientX, event.clientY), false);
    },
    true,
  );

  document.body.addEventListener("mouseleave", function () {
    clearDropTarget();
  });
`;
}
