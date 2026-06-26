export type CanvasBridgeOptions = {
  canEdit: boolean;
};

export type BlockSelectMessage = {
  type: "block-select";
  blockId: string;
};

export type BlockEditStartMessage = {
  type: "block-edit-start";
  blockId: string;
};

export type BlockEditCommitMessage = {
  type: "block-edit-commit";
  blockId: string;
  prop: string;
  value: string;
};

export type SelectBlockMessage = {
  type: "select-block";
  blockId: string | null;
  label?: string | null;
};

export type CanvasBridgeInboundMessage =
  | BlockSelectMessage
  | BlockEditStartMessage
  | BlockEditCommitMessage;

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

export function isBlockEditStartMessage(
  data: unknown,
): data is BlockEditStartMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  return (
    message.type === "block-edit-start" && typeof message.blockId === "string"
  );
}

export function isBlockEditCommitMessage(
  data: unknown,
): data is BlockEditCommitMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  return (
    message.type === "block-edit-commit" &&
    typeof message.blockId === "string" &&
    typeof message.prop === "string" &&
    typeof message.value === "string"
  );
}

const CANVAS_BRIDGE_STYLES = (canEdit: boolean) => `<style id="canvas-bridge-styles">
[data-block-id] { cursor: pointer; }
${canEdit ? "[data-editable] { cursor: text; }\n" : ""}#canvas-bridge-layer {
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
  var layer = null;
  var hoverFrame = null;
  var selectionFrame = null;
  var toolbar = null;
  var toolbarLabel = null;
  var toolbarActions = null;
  var selectedBlockId = null;
  var hoveredBlock = null;
  var resizeObserver = null;
  var editingElement = null;
  var editingBlockId = null;

  function onEditKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      editingElement.blur();
    }
  }

  function commitEdit() {
    if (!editingElement || !editingBlockId) {
      return;
    }

    var prop = editingElement.getAttribute("data-editable-prop");
    if (!prop) {
      editingElement.contentEditable = "false";
      editingElement.removeEventListener("keydown", onEditKeydown);
      editingElement = null;
      editingBlockId = null;
      return;
    }

    var value = editingElement.textContent || "";
    var blockId = editingBlockId;
    editingElement.contentEditable = "false";
    editingElement.removeEventListener("keydown", onEditKeydown);
    editingElement = null;
    editingBlockId = null;
    window.parent.postMessage(
      { type: "block-edit-commit", blockId: blockId, prop: prop, value: value },
      "*",
    );
  }

  function onEditBlur() {
    commitEdit();
  }

  function startEdit(element) {
    if (!canEdit || editingElement) {
      return;
    }

    var block = element.closest("[data-block-id]");
    if (!block) {
      return;
    }

    var blockId = block.getAttribute("data-block-id");
    if (!blockId) {
      return;
    }

    if (!element.getAttribute("data-editable-prop")) {
      element.setAttribute("data-editable-prop", "text");
    }

    editingElement = element;
    editingBlockId = blockId;
    applySelection(blockId, null);
    element.contentEditable = "true";
    element.addEventListener("blur", onEditBlur, { once: true });
    element.addEventListener("keydown", onEditKeydown);
    element.focus();

    var range = document.createRange();
    range.selectNodeContents(element);
    var selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    window.parent.postMessage({ type: "block-edit-start", blockId: blockId }, "*");
  }

  function resolveElement(target) {
    if (!target) {
      return null;
    }
    if (target.nodeType === 3) {
      return target.parentElement;
    }
    if (target.nodeType === 1) {
      return target;
    }
    return null;
  }

  function findEditableElement(block) {
    var marked = block.querySelector("[data-editable]");
    if (marked) {
      return marked;
    }

    var label = block.getAttribute("data-block-label");
    if (label !== "Heading" && label !== "Text" && label !== "Button") {
      return null;
    }

    return (
      block.querySelector("h1,h2,h3,h4,h5,h6,p,a") || block
    );
  }

  function findEditableTarget(target) {
    var element = resolveElement(target);
    if (!element) {
      return null;
    }

    var editable = element.closest("[data-editable]");
    if (editable) {
      return editable;
    }

    var block = element.closest("[data-block-id]");
    if (!block) {
      return null;
    }

    return findEditableElement(block);
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
    "click",
    function (event) {
      if (editingElement) {
        return;
      }

      var element = resolveElement(event.target);
      if (!element) {
        return;
      }
      var block = element.closest("[data-block-id]");
      if (!block) {
        return;
      }
      var blockId = block.getAttribute("data-block-id");
      if (!blockId) {
        return;
      }

      var editable = canEdit ? findEditableTarget(event.target) : null;
      if (editable) {
        event.preventDefault();
        event.stopPropagation();
        var target = editable;
        setTimeout(function () {
          startEdit(target);
        }, 0);
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
      var target = editable;
      setTimeout(function () {
        startEdit(target);
      }, 0);
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
  const injection = `${CANVAS_BRIDGE_STYLES(options.canEdit)}<script id="canvas-bridge-script">${buildBridgeScript(options.canEdit)}</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${injection}</body>`);
  }

  return `${html}${injection}`;
}
