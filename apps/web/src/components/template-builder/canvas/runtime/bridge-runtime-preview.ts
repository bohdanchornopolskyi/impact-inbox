export function getCanvasBridgePreviewRuntime(): string {
  return `
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
`;
}
