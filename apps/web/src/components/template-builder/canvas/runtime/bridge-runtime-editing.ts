export function getCanvasBridgeEditingRuntime(): string {
  return `
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
`;
}
