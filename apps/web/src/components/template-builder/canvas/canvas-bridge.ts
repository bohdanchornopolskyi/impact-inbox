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
  editKind?: "plain" | "richtext";
};

export type BlockEditCommitMessage = {
  type: "block-edit-commit";
  blockId: string;
  prop: string;
  value: string;
};

export type BlockEditSyncMessage = {
  type: "block-edit-sync";
  blockId: string;
  prop: string;
  value: string;
};

export type BlockEditCancelMessage = {
  type: "block-edit-cancel";
  blockId: string;
};

export const RICHTEXT_HEADING_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
] as const;

export type RichtextHeadingTag = (typeof RICHTEXT_HEADING_TAGS)[number];

export type RichtextFormatStateData = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  heading: RichtextHeadingTag;
};

export type RichtextFormatStateMessage = {
  type: "richtext-format-state";
  blockId: string;
  state: RichtextFormatStateData;
};

export type SelectBlockMessage = {
  type: "select-block";
  blockId: string | null;
  label?: string | null;
};

export type UpdatePreviewMessage = {
  type: "update-preview";
  html: string;
};

export type PreviewNeedsReloadMessage = {
  type: "preview-needs-reload";
};

export type CanvasBridgeInboundMessage =
  | BlockSelectMessage
  | BlockEditStartMessage
  | BlockEditCommitMessage
  | BlockEditSyncMessage
  | BlockEditCancelMessage
  | RichtextFormatStateMessage;

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
  if (message.type !== "block-edit-start" || typeof message.blockId !== "string") {
    return false;
  }

  if (message.editKind !== undefined) {
    if (message.editKind !== "plain" && message.editKind !== "richtext") {
      return false;
    }
  }

  return true;
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

export function isBlockEditSyncMessage(
  data: unknown,
): data is BlockEditSyncMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  return (
    message.type === "block-edit-sync" &&
    typeof message.blockId === "string" &&
    typeof message.prop === "string" &&
    typeof message.value === "string"
  );
}

export function isBlockEditCancelMessage(
  data: unknown,
): data is BlockEditCancelMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  return (
    message.type === "block-edit-cancel" && typeof message.blockId === "string"
  );
}

export function isRichtextFormatStateMessage(
  data: unknown,
): data is RichtextFormatStateMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Record<string, unknown>;
  if (
    message.type !== "richtext-format-state" ||
    typeof message.blockId !== "string"
  ) {
    return false;
  }

  if (!message.state || typeof message.state !== "object") {
    return false;
  }

  const state = message.state as Record<string, unknown>;
  for (const key of ["bold", "italic", "underline"] as const) {
    if (typeof state[key] !== "boolean") {
      return false;
    }
  }

  if (
    typeof state.heading !== "string" ||
    !RICHTEXT_HEADING_TAGS.includes(state.heading as RichtextHeadingTag)
  ) {
    return false;
  }

  return true;
}

export function isPreviewNeedsReloadMessage(
  data: unknown,
): data is PreviewNeedsReloadMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  return (data as Record<string, unknown>).type === "preview-needs-reload";
}

const CANVAS_BRIDGE_STYLES = (canEdit: boolean) => `<style id="canvas-bridge-styles">
[data-block-id] { cursor: pointer; }
[data-block-id] a[data-canvas-link-disabled] { cursor: inherit; text-decoration: inherit; color: inherit; }
${canEdit ? "[data-editable] { cursor: text; }\n[data-editable][contenteditable=\"true\"] { outline: none; box-shadow: none; }\n" : ""}#canvas-bridge-layer {
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
  var editingKind = null;
  var editingSnapshotHtml = null;
  var savedRange = null;
  var syncTimer = null;

  function isRichtextEditing() {
    return editingKind === "richtext";
  }

  function saveSelection() {
    if (!editingElement) {
      return;
    }
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      return;
    }
    var range = sel.getRangeAt(0);
    if (editingElement.contains(range.commonAncestorContainer)) {
      savedRange = range.cloneRange();
    }
  }

  function restoreSelection() {
    if (!savedRange) {
      return;
    }
    var sel = window.getSelection();
    if (!sel) {
      return;
    }
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  function resolveHeadingTag() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editingElement) {
      return "p";
    }
    var node = sel.anchorNode;
    if (!node) {
      return "p";
    }
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== editingElement) {
      var tag = el.tagName ? el.tagName.toLowerCase() : "";
      if (
        tag === "h1" ||
        tag === "h2" ||
        tag === "h3" ||
        tag === "h4" ||
        tag === "h5" ||
        tag === "h6"
      ) {
        return tag;
      }
      if (tag === "p" || tag === "div") {
        return "p";
      }
      el = el.parentElement;
    }
    return "p";
  }

  function postRichtextFormatState(blockId, state) {
    window.parent.postMessage(
      { type: "richtext-format-state", blockId: blockId, state: state },
      "*",
    );
  }

  function measureRichtextFormatState(richtextEl) {
    var bold = false;
    var italic = false;
    var underline = false;
    var heading = "p";
    var walker = document.createTreeWalker(
      richtextEl,
      NodeFilter.SHOW_TEXT,
      null,
    );
    var textNode = walker.nextNode();
    if (textNode) {
      var el = textNode.parentElement;
      while (el && el !== richtextEl) {
        var tag = el.tagName ? el.tagName.toUpperCase() : "";
        if (tag === "STRONG" || tag === "B") {
          bold = true;
        }
        if (tag === "EM" || tag === "I") {
          italic = true;
        }
        if (tag === "U") {
          underline = true;
        }
        el = el.parentElement;
      }
    }
    var block = richtextEl.querySelector("h1,h2,h3,h4,h5,h6,p");
    if (block) {
      var blockTag = block.tagName.toLowerCase();
      if (
        blockTag === "h1" ||
        blockTag === "h2" ||
        blockTag === "h3" ||
        blockTag === "h4" ||
        blockTag === "h5" ||
        blockTag === "h6"
      ) {
        heading = blockTag;
      }
    }
    return { bold: bold, italic: italic, underline: underline, heading: heading };
  }

  function reportRichtextFormatStateForBlock(blockId) {
    if (isRichtextEditing()) {
      return;
    }
    var block = findBlockElement(blockId);
    if (!block || !isRichtextEditableBlock(block)) {
      return;
    }
    var richtext = block.querySelector("[data-editable-kind=richtext]");
    if (!richtext) {
      return;
    }
    postRichtextFormatState(blockId, measureRichtextFormatState(richtext));
  }

  function reportRichtextFormatState() {
    if (!isRichtextEditing() || !editingBlockId) {
      return;
    }
    postRichtextFormatState(editingBlockId, {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      heading: resolveHeadingTag(),
    });
  }

  function onSelectionChange() {
    if (!isRichtextEditing()) {
      return;
    }
    saveSelection();
    reportRichtextFormatState();
  }

  function ensureRichtextEditing(blockId) {
    if (isRichtextEditing()) {
      if (editingBlockId === blockId) {
        return true;
      }
      commitEdit();
    }
    var block = findBlockElement(blockId);
    if (!block) {
      return false;
    }
    startRichtextEdit(block);
    return !!editingElement;
  }

  function focusRichtextForCommand() {
    if (!editingElement) {
      return;
    }
    editingElement.focus();
    if (!savedRange) {
      var range = document.createRange();
      range.selectNodeContents(editingElement);
      var selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      saveSelection();
      return;
    }
    restoreSelection();
  }

  function findRichtextBlockElement(node) {
    if (!node || !editingElement) {
      return null;
    }
    var el = node.nodeType === 3 ? node.parentElement : node;
    var blockTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "div"];
    while (el && el !== editingElement) {
      var tag = el.tagName ? el.tagName.toLowerCase() : "";
      if (blockTags.indexOf(tag) >= 0) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function applyRichtextCommand(command, value, blockId) {
    if (!ensureRichtextEditing(blockId)) {
      return;
    }
    focusRichtextForCommand();
    try {
      document.execCommand("styleWithCSS", false, "false");
    } catch (e) {}
    document.execCommand(command, false, value);
    saveSelection();
    reportRichtextFormatState();
    syncRichtextHtml();
  }

  function applyRichtextHeading(tag, blockId) {
    if (!ensureRichtextEditing(blockId)) {
      return;
    }
    focusRichtextForCommand();

    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      return;
    }

    var block = findRichtextBlockElement(sel.anchorNode);
    if (block && block.parentElement) {
      var currentTag = block.tagName.toLowerCase();
      var normalizedCurrent = currentTag === "div" ? "p" : currentTag;
      if (normalizedCurrent !== tag) {
        var replacement = document.createElement(tag);
        replacement.innerHTML = block.innerHTML;
        if (tag !== "p") {
          replacement.style.margin = "0";
        }
        block.parentElement.replaceChild(replacement, block);
        var range = document.createRange();
        range.selectNodeContents(replacement);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        saveSelection();
        reportRichtextFormatState();
        syncRichtextHtml();
        return;
      }
      reportRichtextFormatState();
      return;
    }

    document.execCommand("formatBlock", false, tag === "p" ? "<p>" : "<" + tag + ">");
    saveSelection();
    reportRichtextFormatState();
    syncRichtextHtml();
  }

  function flushRichtextSync() {
    if (!isRichtextEditing() || !editingElement || !editingBlockId) {
      return;
    }
    var prop = editingElement.getAttribute("data-editable-prop");
    if (!prop) {
      return;
    }
    window.parent.postMessage(
      {
        type: "block-edit-sync",
        blockId: editingBlockId,
        prop: prop,
        value: editingElement.innerHTML,
      },
      "*",
    );
  }

  function syncRichtextHtml() {
    if (syncTimer) {
      clearTimeout(syncTimer);
    }
    syncTimer = setTimeout(function () {
      syncTimer = null;
      flushRichtextSync();
    }, 200);
  }

  function onRichtextInput() {
    syncRichtextHtml();
  }

  function onRichtextBlur(event) {
    if (editingKind !== "richtext" || !editingElement) {
      return;
    }
    var related = event.relatedTarget;
    if (related && editingElement.contains(related)) {
      return;
    }
    commitEdit();
  }

  function onEditKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
      return;
    }
    if (editingKind === "richtext") {
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      editingElement.blur();
    }
  }

  function teardownEditing() {
    if (!editingElement) {
      return;
    }
    editingElement.contentEditable = "false";
    editingElement.removeEventListener("keydown", onEditKeydown);
    editingElement.removeEventListener("blur", onEditBlur);
    editingElement.removeEventListener("blur", onRichtextBlur);
    editingElement.removeEventListener("input", onRichtextInput);
    document.removeEventListener("selectionchange", onSelectionChange);
    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }
    editingElement = null;
    editingBlockId = null;
    editingKind = null;
    editingSnapshotHtml = null;
    savedRange = null;
  }

  function commitEdit() {
    if (!editingElement || !editingBlockId) {
      return;
    }

    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
      flushRichtextSync();
    }

    var prop = editingElement.getAttribute("data-editable-prop");
    var value =
      editingKind === "richtext"
        ? editingElement.innerHTML
        : editingElement.textContent || "";
    var blockId = editingBlockId;
    teardownEditing();

    if (prop) {
      window.parent.postMessage(
        { type: "block-edit-commit", blockId: blockId, prop: prop, value: value },
        "*",
      );
    }
  }

  function cancelEditing() {
    if (!editingElement || !editingBlockId) {
      return;
    }
    if (editingKind === "richtext" && editingSnapshotHtml !== null) {
      editingElement.innerHTML = editingSnapshotHtml;
    }
    var blockId = editingBlockId;
    teardownEditing();
    window.parent.postMessage(
      { type: "block-edit-cancel", blockId: blockId },
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
    editingKind = "plain";
    applySelection(blockId, null);
    element.contentEditable = "true";
    element.addEventListener("blur", onEditBlur);
    element.addEventListener("keydown", onEditKeydown);
    element.focus();

    var range = document.createRange();
    range.selectNodeContents(element);
    var selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    window.parent.postMessage(
      { type: "block-edit-start", blockId: blockId, editKind: "plain" },
      "*",
    );
  }

  function startRichtextEdit(block) {
    if (!canEdit || editingElement) {
      return;
    }

    var blockId = block.getAttribute("data-block-id");
    if (!blockId) {
      return;
    }

    var element = resolveChromeElement(block);
    if (!element) {
      return;
    }

    if (!element.getAttribute("data-editable-prop")) {
      element.setAttribute("data-editable-prop", "html");
    }

    editingElement = element;
    editingBlockId = blockId;
    editingKind = "richtext";
    editingSnapshotHtml = element.innerHTML;
    applySelection(blockId, block.getAttribute("data-block-label"));
    element.contentEditable = "true";
    element.addEventListener("keydown", onEditKeydown);
    element.addEventListener("blur", onRichtextBlur);
    element.addEventListener("input", onRichtextInput);
    document.addEventListener("selectionchange", onSelectionChange);
    element.focus();
    saveSelection();
    reportRichtextFormatState();

    window.parent.postMessage(
      { type: "block-edit-start", blockId: blockId, editKind: "richtext" },
      "*",
    );
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

  function isPlainTextEditableBlock(block) {
    var label = block.getAttribute("data-block-label");
    return label === "Heading" || label === "Text";
  }

  function isRichtextEditableBlock(block) {
    return block.getAttribute("data-block-label") === "Rich Text";
  }

  function isCanvasEditableBlock(block) {
    return isPlainTextEditableBlock(block) || isRichtextEditableBlock(block);
  }

  function resolveChromeElement(block) {
    if (!block) {
      return block;
    }

    if (isRichtextEditableBlock(block)) {
      var richtext = block.querySelector("[data-editable-kind=richtext]");
      if (richtext) {
        return richtext;
      }
    }

    return block;
  }

  function findEditableElement(block) {
    if (!isCanvasEditableBlock(block)) {
      return null;
    }

    var marked = block.querySelector("[data-editable]");
    if (marked) {
      return marked;
    }

    if (isPlainTextEditableBlock(block)) {
      return (
        block.querySelector("h1 span, h2 span, h3 span, h4 span, h5 span, h6 span, p span") ||
        block.querySelector("h1,h2,h3,h4,h5,h6,p")
      );
    }

    return null;
  }

  function findEditableBlock(target) {
    var element = resolveElement(target);
    if (!element) {
      return null;
    }

    var block = element.closest("[data-block-id]");
    if (!block || !isCanvasEditableBlock(block)) {
      return null;
    }

    return block;
  }

  function findEditableTarget(target) {
    var element = resolveElement(target);
    if (!element) {
      return null;
    }

    var block = element.closest("[data-block-id]");
    if (!block || !isCanvasEditableBlock(block)) {
      return null;
    }

    var editable = element.closest("[data-editable]");
    if (
      editable &&
      editable !== block &&
      !editable.hasAttribute("data-block-id")
    ) {
      return editable;
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

  function resolveBlockLabel(element) {
    var block = element.closest("[data-block-id]");
    return block ? (block.getAttribute("data-block-label") || "") : "";
  }

  function resolveLabel(element, label) {
    if (label) {
      return label;
    }
    return element.getAttribute("data-block-label") || resolveBlockLabel(element);
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
    positionToolbar(resolveChromeElement(selected), toolbarLabel.textContent || null);
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

    if (label) {
      toolbarLabel.textContent = label;
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

  function disableBlockLinks(root) {
    var scope = root || document;
    var anchors = scope.querySelectorAll("[data-block-id] a[href]");
    for (var i = 0; i < anchors.length; i += 1) {
      anchors[i].setAttribute("data-canvas-link-disabled", "");
      anchors[i].removeAttribute("href");
    }
  }

  function parsePreviewDocument(html) {
    return new DOMParser().parseFromString(html, "text/html");
  }

  function updatePreview(html) {
    if (editingElement) {
      return;
    }

    var parsed = parsePreviewDocument(html);
    var newBlocks = parsed.querySelectorAll("[data-block-id]");
    var currentBlocks = document.querySelectorAll("[data-block-id]");

    if (newBlocks.length !== currentBlocks.length) {
      window.parent.postMessage({ type: "preview-needs-reload" }, "*");
      return;
    }

    var newById = {};
    for (var i = 0; i < newBlocks.length; i += 1) {
      var nextBlock = newBlocks[i];
      var nextId = nextBlock.getAttribute("data-block-id");
      if (!nextId) {
        window.parent.postMessage({ type: "preview-needs-reload" }, "*");
        return;
      }
      newById[nextId] = nextBlock;
    }

    for (var j = 0; j < currentBlocks.length; j += 1) {
      var current = currentBlocks[j];
      var blockId = current.getAttribute("data-block-id");
      if (!blockId) {
        window.parent.postMessage({ type: "preview-needs-reload" }, "*");
        return;
      }

      var replacementSource = newById[blockId];
      if (!replacementSource) {
        window.parent.postMessage({ type: "preview-needs-reload" }, "*");
        return;
      }

      if (current.outerHTML === replacementSource.outerHTML) {
        continue;
      }

      var replacement = replacementSource.cloneNode(true);
      current.parentNode.replaceChild(replacement, current);
      disableBlockLinks(replacement);

      if (blockId === selectedBlockId) {
        observeSelectedBlock(resolveChromeElement(replacement));
        reportRichtextFormatStateForBlock(blockId);
      }
    }

    updatePositions();
  }

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

  document.addEventListener(
    "click",
    function (event) {
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

      var editable = canEdit ? findEditableTarget(event.target) : null;
      if (editable) {
        var editableBlock = findEditableBlock(event.target);
        if (!editableBlock || !isRichtextEditableBlock(editableBlock)) {
          event.preventDefault();
          event.stopPropagation();
          var target = editable;
          setTimeout(function () {
            startEdit(target);
          }, 0);
          return;
        }
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
