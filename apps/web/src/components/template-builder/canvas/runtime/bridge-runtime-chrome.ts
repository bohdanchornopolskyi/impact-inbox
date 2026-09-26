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

  function setTypeTag(tag, element, label) {
    if (!tag) {
      return;
    }
    var text = resolveLabel(element, label);
    tag.textContent = text;
    tag.style.display = text ? "block" : "none";
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

    if (!canEdit || !toolbarActions || toolbarActions.childElementCount === 0) {
      hideToolbar();
      return;
    }

    toolbar.style.display = "flex";
    var gutterGap = 12;
    var anchor = document.querySelector("[data-canvas-body]") || element;
    var maxLeft =
      document.documentElement.clientWidth - toolbar.offsetWidth - gutterGap;
    var left = Math.min(anchor.getBoundingClientRect().right + gutterGap, maxLeft);
    toolbar.style.top = element.getBoundingClientRect().top + window.scrollY + "px";
    toolbar.style.left = left + window.scrollX + "px";
  }

  function findBlockElement(blockId) {
    if (!blockId) {
      return null;
    }
    return document.querySelector('[data-block-id="' + blockId + '"]');
  }

  function updatePositions() {
    if (hoveredBlock && hoveredBlock.getAttribute("data-block-id") !== selectedBlockId) {
      var hoverChrome = resolveChromeElement(hoveredBlock);
      positionFrame(hoverFrame, hoverChrome);
      setTypeTag(hoverTag, hoverChrome);
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

    var selectedChrome = resolveChromeElement(selected);
    positionFrame(selectionFrame, selectedChrome);
    setTypeTag(
      selectionTag,
      selectedChrome,
      toolbarLabel ? toolbarLabel.textContent || null : null,
    );
    positionToolbar(
      selectedChrome,
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
    var hoverChrome = resolveChromeElement(element);
    positionFrame(hoverFrame, hoverChrome);
    setTypeTag(hoverTag, hoverChrome);
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
    setTypeTag(selectionTag, chrome, label || null);
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
