import {
  CANVAS_DRAG_ACTIVATION_PX,
  CANVAS_PLAIN_TEXT_EDITABLE_TYPES,
  CANVAS_RICHTEXT_EDITABLE_TYPES,
  RICHTEXT_HEADING_INLINE_STYLES,
  type CanvasDropTarget,
} from "@repo/shared";

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

export type CanvasDropTargetMessage = {
  type: "canvas-drop-target";
  target: CanvasDropTarget | null;
};

export type CanvasBridgeInboundMessage =
  | BlockSelectMessage
  | BlockEditStartMessage
  | BlockEditCommitMessage
  | BlockEditSyncMessage
  | BlockEditCancelMessage
  | RichtextFormatStateMessage
  | CanvasDropTargetMessage;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isCanvasDropTargetValue(value: unknown): value is CanvasDropTarget {
  if (!isRecord(value) || typeof value.index !== "number") {
    return false;
  }

  switch (value.kind) {
    case "body":
      return true;
    case "section":
      return typeof value.sectionId === "string";
    case "row":
      return typeof value.rowId === "string";
    case "column":
      return typeof value.columnId === "string";
    default:
      return false;
  }
}

export function isCanvasDropTargetMessage(
  data: unknown,
): data is CanvasDropTargetMessage {
  if (!isRecord(data) || data.type !== "canvas-drop-target") {
    return false;
  }

  if (data.target === null) {
    return true;
  }

  return isCanvasDropTargetValue(data.target);
}

const CANVAS_BRIDGE_STYLES = (canEdit: boolean) => `<style id="canvas-bridge-styles">
[data-block-id] { cursor: pointer; }
[data-block-id][data-layout-role] { cursor: grab; }
[data-block-id].canvas-bridge-dragging { cursor: grabbing; }
[data-block-id] a[data-canvas-link-disabled] { cursor: inherit; text-decoration: inherit; color: inherit; }
${canEdit ? "[data-editable] { cursor: text; }\n[data-editable][contenteditable=\"true\"] { outline: none; box-shadow: none; }\n" : ""}html, body {
  overflow: visible !important;
}
#canvas-bridge-layer {
  position: absolute;
  inset: 0;
  overflow: visible;
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
.canvas-bridge-dragging {
  opacity: 0.45;
}
.canvas-bridge-toolbar {
  position: absolute;
  display: none;
  align-items: center;
  gap: 2px;
  height: 32px;
  padding: 0 4px 0 0;
  background: rgba(55, 65, 81, 0.95);
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
  pointer-events: auto;
}
.canvas-bridge-label {
  padding: 0 8px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  user-select: none;
}
.canvas-bridge-toolbar-below {
  border-radius: 16px;
}
.canvas-bridge-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: inherit;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
}
.canvas-bridge-toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}
.canvas-bridge-toolbar-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.canvas-bridge-drag-handle {
  cursor: grab;
}
.canvas-bridge-drag-handle:active:not(:disabled) {
  cursor: grabbing;
}
.canvas-bridge-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.canvas-bridge-drop-indicator {
  position: absolute;
  display: none;
  height: 2px;
  background: #4f46e5;
  border-radius: 1px;
  pointer-events: none;
  z-index: 2147483647;
}
[data-empty-column] [data-canvas-empty-placeholder] {
  display: block;
  min-height: 48px;
  box-sizing: border-box;
  border: 1px dashed rgba(79, 70, 229, 0.35);
  border-radius: 4px;
  background: rgba(79, 70, 229, 0.04);
}
</style>`;

function buildBridgeScript(canEdit: boolean): string {
  const plainTextEditableTypes = JSON.stringify([
    ...CANVAS_PLAIN_TEXT_EDITABLE_TYPES,
  ]);
  const richtextEditableTypes = JSON.stringify([
    ...CANVAS_RICHTEXT_EDITABLE_TYPES,
  ]);
  const richtextHeadingStyles = JSON.stringify(RICHTEXT_HEADING_INLINE_STYLES);
  const dragActivationPx = CANVAS_DRAG_ACTIVATION_PX;

  return `(function () {
  var canEdit = ${JSON.stringify(canEdit)};
  var dragActivationPx = ${dragActivationPx};
  var plainTextEditableTypes = ${plainTextEditableTypes};
  var richtextEditableTypes = ${richtextEditableTypes};
  var richtextHeadingStyles = ${richtextHeadingStyles};
  var layer = null;
  var hoverFrame = null;
  var selectionFrame = null;
  var toolbar = null;
  var toolbarLabel = null;
  var toolbarActions = null;
  var dropIndicator = null;
  var selectedBlockId = null;
  var hoveredBlock = null;
  var resizeObserver = null;
  var editingElement = null;
  var editingBlockId = null;
  var editingKind = null;
  var editingSnapshotHtml = null;
  var savedRange = null;
  var syncTimer = null;
  var activeDropTarget = null;
  var isDragSession = false;
  var dragBlockId = null;
  var dragKind = null;
  var dragPointer = null;
  var suppressBlockClick = false;
  var dragHandleSvg =
    '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><circle cx="4" cy="3" r="1.2" fill="currentColor"/><circle cx="10" cy="3" r="1.2" fill="currentColor"/><circle cx="4" cy="7" r="1.2" fill="currentColor"/><circle cx="10" cy="7" r="1.2" fill="currentColor"/><circle cx="4" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="11" r="1.2" fill="currentColor"/></svg>';

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
    var block = richtextEl.querySelector("h1,h2,h3,h4,h5,h6");
    if (block) {
      heading = block.tagName.toLowerCase();
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
    if (el === editingElement) {
      var sel = window.getSelection();
      var child = null;
      if (sel && sel.rangeCount > 0) {
        var offset = sel.getRangeAt(0).startOffset;
        child =
          editingElement.childNodes[offset] ||
          editingElement.childNodes[offset - 1] ||
          editingElement.firstChild;
      } else {
        child = editingElement.firstChild;
      }
      el = child && child.nodeType === 3 ? child.parentElement : child;
    }
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
        if (tag !== "p" && richtextHeadingStyles[tag]) {
          replacement.setAttribute("style", richtextHeadingStyles[tag]);
        } else {
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
    var wasRichtext = editingKind === "richtext";
    teardownEditing();

    if (prop) {
      window.parent.postMessage(
        { type: "block-edit-commit", blockId: blockId, prop: prop, value: value },
        "*",
      );
    }

    if (wasRichtext && blockId === selectedBlockId) {
      reportRichtextFormatStateForBlock(blockId);
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

    abortDragPointerSession();

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
    range.collapse(false);
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

    abortDragPointerSession();

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
    var type = block.getAttribute("data-block-type");
    return plainTextEditableTypes.indexOf(type) !== -1;
  }

  function isRichtextEditableBlock(block) {
    var type = block.getAttribute("data-block-type");
    return richtextEditableTypes.indexOf(type) !== -1;
  }

  function isCanvasEditableBlock(block) {
    return isPlainTextEditableBlock(block) || isRichtextEditableBlock(block);
  }

  function resolveChromeElement(block) {
    if (!block) {
      return block;
    }

    if (block.hasAttribute("data-layout-role")) {
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

  function resolveColumnContentTarget(columnEl, clientY) {
    var columnId = columnEl.getAttribute("data-block-id");
    if (!columnId) {
      return null;
    }
    var contentBlocks = getContentBlocksInColumn(columnEl);
    if (contentBlocks.length === 0) {
      return { kind: "column", columnId: columnId, index: 0 };
    }
    var index = resolveInsertionIndex(clientY, getVerticalBounds(contentBlocks));
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

  function postDropTarget(target) {
    if (dropTargetsEqual(activeDropTarget, target)) {
      return;
    }
    activeDropTarget = target;
    window.parent.postMessage(
      { type: "canvas-drop-target", target: target },
      "*",
    );
  }

  function clearDropTarget() {
    postDropTarget(null);
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

      if (dragPointer.active) {
        suppressBlockClick = true;
      }

      detachDragPointerListeners(dragPointer);

      postDragCommit(dragPointer.blockId, activeDropTarget);

      clearDragSession();
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

  function resolveColumnContentTargetForDrag(clientX, clientY) {
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
      var sectionRect = section.getBoundingClientRect();
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
      var rowRect = row.getBoundingClientRect();
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
      showColumnContentDropIndicator(target);
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

  function showColumnContentDropIndicator(target) {
    var column = findBlockElement(target.columnId);
    if (!column) {
      hideDropIndicator();
      return;
    }

    var blocks = getContentBlocksInColumn(column);
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
    if (!dragKind || !dragBlockId) {
      return null;
    }

    if (dragKind === "content") {
      return resolveColumnContentTargetForDrag(clientX, clientY);
    }

    if (dragKind === "section") {
      return resolveBodySectionTarget(clientY, dragBlockId);
    }

    if (dragKind === "row") {
      return resolveSectionRowTarget(clientX, clientY, dragBlockId);
    }

    if (dragKind === "column") {
      return resolveRowColumnTarget(clientX, clientY, dragBlockId);
    }

    return null;
  }

  function handlePointerAtDuringDrag(x, y) {
    var target = resolveDropTargetForDrag(x, y);
    if (target) {
      showDropIndicator(target);
      postDropTarget(target);
      return;
    }

    hideDropIndicator();
    postDropTarget(null);
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
      postDropTarget(resolveDropTarget(event.clientX, event.clientY));
    },
    true,
  );

  document.body.addEventListener("mouseleave", function () {
    clearDropTarget();
  });

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
