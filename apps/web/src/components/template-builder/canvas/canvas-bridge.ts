export type CanvasBridgeOptions = {
  canEdit: boolean;
};

export type BlockSelectMessage = {
  type: "block-select";
  blockId: string;
};

export type SelectBlockMessage = {
  type: "select-block";
  blockId: string | null;
  label?: string | null;
};

export type CanvasBridgeInboundMessage = BlockSelectMessage;

export function isBlockSelectMessage(
  data: unknown,
): data is BlockSelectMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  return (
    message.type === "block-select" && typeof message.blockId === "string"
  );
}

const CANVAS_BRIDGE_STYLES = `<style id="canvas-bridge-styles">
[data-block-id] { cursor: pointer; }
#canvas-bridge-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 2147483646;
  pointer-events: none;
}
.canvas-bridge-frame {
  position: absolute;
  display: none;
  box-sizing: border-box;
  pointer-events: none;
}
.canvas-bridge-hover {
  border: 1px dashed rgba(79, 70, 229, 0.55);
}
.canvas-bridge-selected {
  border: 2px solid #4f46e5;
}
.canvas-bridge-toolbar {
  position: absolute;
  display: none;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  background: #4f46e5;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  border-radius: 4px 4px 0 0;
  white-space: nowrap;
  pointer-events: auto;
}
.canvas-bridge-toolbar-below {
  border-radius: 0 0 4px 4px;
}
.canvas-bridge-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>`;

function buildBridgeScript(canEdit: boolean): string {
  return `(function () {
  var canEdit = ${JSON.stringify(canEdit)};
  void canEdit;

  var layer = null;
  var hoverFrame = null;
  var selectionFrame = null;
  var toolbar = null;
  var toolbarLabel = null;
  var toolbarActions = null;
  var selectedBlockId = null;
  var hoveredBlock = null;
  var resizeObserver = null;

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
    layer.appendChild(toolbar);
    document.body.appendChild(layer);
  }

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

  function resolveLabel(element, label) {
    if (label) {
      return label;
    }
    return element.getAttribute("data-block-label") || "";
  }

  function positionToolbar(element, label) {
    var rect = element.getBoundingClientRect();
    var toolbarHeight = 24;
    toolbarLabel.textContent = resolveLabel(element, label);
    toolbar.style.display = "flex";
    var top = rect.top + window.scrollY - toolbarHeight;
    if (top < window.scrollY) {
      toolbar.classList.add("canvas-bridge-toolbar-below");
      toolbar.style.top = rect.bottom + window.scrollY + "px";
    } else {
      toolbar.classList.remove("canvas-bridge-toolbar-below");
      toolbar.style.top = top + "px";
    }
    toolbar.style.left = rect.left + window.scrollX + "px";
  }

  function findBlockElement(blockId) {
    if (!blockId) {
      return null;
    }
    return document.querySelector('[data-block-id="' + blockId + '"]');
  }

  function updatePositions() {
    if (hoveredBlock && hoveredBlock.getAttribute("data-block-id") !== selectedBlockId) {
      positionFrame(hoverFrame, hoveredBlock);
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

    positionFrame(selectionFrame, selected);
    positionToolbar(selected, toolbarLabel.textContent || null);
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
    positionFrame(hoverFrame, element);
  }

  function applySelection(blockId, label) {
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

    if (label) {
      toolbarLabel.textContent = label;
    }

    positionFrame(selectionFrame, target);
    positionToolbar(target, label || null);
    observeSelectedBlock(target);

    if (hoveredBlock && hoveredBlock.getAttribute("data-block-id") === blockId) {
      clearHover();
    }
  }

  document.addEventListener(
    "mouseover",
    function (event) {
      var target = event.target;
      if (!target || !target.closest) {
        clearHover();
        return;
      }
      var block = target.closest("[data-block-id]");
      if (!block) {
        clearHover();
        return;
      }
      setHover(block);
    },
    true,
  );

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || !target.closest) {
        return;
      }
      var block = target.closest("[data-block-id]");
      if (!block) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      var blockId = block.getAttribute("data-block-id");
      if (!blockId) {
        return;
      }
      window.parent.postMessage({ type: "block-select", blockId: blockId }, "*");
    },
    true,
  );

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.type !== "select-block") {
      return;
    }
    applySelection(data.blockId, data.label || null);
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
})();`;
}

export function buildCanvasBridgeDocument(
  html: string,
  options: CanvasBridgeOptions,
): string {
  const injection = `${CANVAS_BRIDGE_STYLES}<script id="canvas-bridge-script">${buildBridgeScript(options.canEdit)}</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${injection}</body>`);
  }

  return `${html}${injection}`;
}
