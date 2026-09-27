import { describe, expect, it } from "vitest";
import {
  buildCanvasBridgeDocument,
  isBlockEditCancelMessage,
  isBlockEditCommitMessage,
  isBlockEditStartMessage,
  isBlockEditSyncMessage,
  isBlockSelectMessage,
  isCanvasDropTargetMessage,
  isRichtextFormatStateMessage,
} from "./canvas-bridge";

describe("buildCanvasBridgeDocument", () => {
  const sampleHtml =
    '<html><body><div data-block-id="heading-1">Hello</div></body></html>';

  // The bridge is a hand-written template string; a syntax error in it ships as
  // a silently dead canvas, so parse it here for both privilege levels.
  it.each([true, false])("emits a parseable script (canEdit: %s)", (canEdit) => {
    const result = buildCanvasBridgeDocument(sampleHtml, { canEdit });
    const script = result.match(
      /<script id="canvas-bridge-script">([\s\S]*?)<\/script>/,
    )?.[1];

    expect(script).toBeTruthy();
    expect(() => new Function(script!)).not.toThrow();
  });

  it("injects style and script before closing body", () => {
    const result = buildCanvasBridgeDocument(sampleHtml, { canEdit: true });

    expect(result).toContain('data-block-id="heading-1"');
    expect(result).toContain('<style id="canvas-bridge-styles">');
    expect(result).toContain("#canvas-bridge-layer");
    expect(result).toContain("canvas-bridge-hover");
    expect(result).toContain("canvas-bridge-toolbar");
    expect(result).toContain("canvas-bridge-type-tag");
    expect(result).toContain("canvas-bridge-drop-dot");
    expect(result).toContain("canvas-bridge-toolbar-btn-danger");
    expect(result).toContain("canvas-bridge-drag-handle");
    expect(result).toContain("canvas-bridge-drop-indicator");
    expect(result).toContain("canvas-drag-handle-down");
    expect(result).toContain("canvas-drag-active");
    expect(result).toContain("canvas-drag-commit");
    expect(result).toContain("dragActivationPx");
    expect(result).toContain("setPointerCapture");
    expect(result).toContain('<script id="canvas-bridge-script">');
    expect(result.indexOf("<style id=\"canvas-bridge-styles\">")).toBeLessThan(
      result.indexOf("</body>"),
    );
    expect(result.indexOf("<script id=\"canvas-bridge-script\">")).toBeLessThan(
      result.indexOf("</body>"),
    );
  });

  it("wires duplicate and delete into the selection toolbar", () => {
    const result = buildCanvasBridgeDocument(sampleHtml, { canEdit: true });

    expect(result).toContain("var moveUpSvg");
    expect(result).toContain("var moveDownSvg");
    expect(result).toContain("var duplicateSvg");
    expect(result).toContain("var deleteSvg");
    expect(result).toContain(
      'createToolbarActionButton("Move up", moveUpSvg, "move-up", index > 0)',
    );
    expect(result).toContain("index >= 0 && index < siblings.length - 1");
    expect(result).toContain(
      'createToolbarActionButton("Duplicate", duplicateSvg, "duplicate")',
    );
    expect(result).toContain('"Delete",\n        deleteSvg,\n        "delete",');
    expect(result).toContain("canRemoveLayoutBlock(block)");
    expect(result).toContain('"action":"duplicate"');
    expect(result).toContain("postBuilderShortcut(action)");
  });

  it("serializes canEdit into the bridge script", () => {
    const editable = buildCanvasBridgeDocument(sampleHtml, { canEdit: true });
    const readOnly = buildCanvasBridgeDocument(sampleHtml, { canEdit: false });

    expect(editable).toContain("var canEdit = true");
    expect(readOnly).toContain("var canEdit = false");
    expect(editable).toContain("[data-editable] { cursor: text; }");
    expect(readOnly).not.toContain("[data-editable] { cursor: text; }");
  });

  it("includes inline edit handlers when editable", () => {
    const result = buildCanvasBridgeDocument(sampleHtml, { canEdit: true });

    expect(result).toContain("block-edit-start");
    expect(result).toContain("block-edit-commit");
    expect(result).toContain("block-edit-cancel");
    expect(result).toContain("contentEditable");
    expect(result).toContain("resolveElement");
    expect(result).toContain("findEditableTarget");
    expect(result).toContain("findEditableElement");
    expect(result).toContain("dblclick");
    expect(result).toContain("disableBlockLinks");
    expect(result).toContain("data-canvas-link-disabled");
    expect(result).toContain("data-block-type");
    expect(result).toContain("plainTextEditableTypes");
    expect(result).toContain("richtextEditableTypes");
    expect(result).toContain("canvas-bridge-label");
    expect(result).toContain("toolbarLabel");
    expect(result).toContain("resolveLabel");
    expect(result).toContain("var gutterGap = 12");
    expect(result).toContain("flex-direction: column");
    expect(result).toContain("startRichtextEdit");
    expect(result).toContain("editKind");
  });

  it("includes richtext in-iframe editing via execCommand", () => {
    const result = buildCanvasBridgeDocument(sampleHtml, { canEdit: true });

    expect(result).toContain("ensureRichtextEditing");
    expect(result).toContain("focusRichtextForCommand");
    expect(result).toContain("findRichtextBlockElement");
    expect(result).toContain("applyRichtextCommand");
    expect(result).toContain("applyRichtextHeading");
    expect(result).toContain("resolveHeadingTag");
    expect(result).toContain("reportRichtextFormatState");
    expect(result).toContain("execCommand");
    expect(result).toContain("richtext-format");
    expect(result).toContain("richtext-format-state");
    expect(result).toContain("richtext-set-heading");
    expect(result).toContain("measureRichtextFormatState");
    expect(result).toContain("reportRichtextFormatStateForBlock");
    expect(result).toContain("richtextHeadingStyles");
    expect(result).toContain("editingSnapshotHtml");
    expect(result).toContain("flushRichtextSync");
    expect(result).toContain("onRichtextBlur");
    expect(result).toContain("block-edit-sync");
    expect(result).toContain("richtext-cancel");
    expect(result).toContain("syncRichtextHtml");
    expect(result).toContain("update-preview");
    expect(result).toContain("preview-needs-reload");
    expect(result).toContain("builder-shortcut");
    expect(result).toContain("event.source !== window.parent");
    expect(result).toContain("data-layout-role");
    expect(result).toContain("resolveDropTarget");
    expect(result).toContain("canvas-drop-target");
    expect(result).toContain("postDragCommit");
    expect(result).toContain("detachDragPointerListeners");
    expect(result).toContain("canStartCanvasDrag");
    expect(result).toContain("onSelectedBlockPointerDown");
    expect(result).toContain("resolveBodySectionTarget");
    expect(result).toContain("resolveSectionRowTarget");
    expect(result).toContain("resolveRowColumnTarget");
    expect(result).toContain("showRowColumnDropIndicator");
    expect(result).toContain("canvas-cancel-drag");
    expect(result).toContain("canvas-drag-pointer");
    expect(result).toContain("data-empty-section");
    expect(result).toContain("data-empty-row");
    expect(result).toContain("palette-drag-active");
    expect(result).toContain("canvas-palette-drag-start");
    expect(result).toContain("canvas-palette-drag-move");
    expect(result).toContain("canvas-palette-drag-end");
    expect(result).toContain("canvas-palette-drag-finish");
    expect(result).toContain("canvas-palette-drag-commit");
    expect(result).toContain("canvas-palette-drag-finish");
    expect(result).toContain("clientX < 0 || clientY < 0");
    expect(result).toContain("sanitizeTargetForDrag");
    expect(result).toContain("setPaletteDragSessionActive");
  });

  it("appends injection when body tag is missing", () => {
    const fragment = '<div data-block-id="text-1">Copy</div>';
    const result = buildCanvasBridgeDocument(fragment, { canEdit: true });

    expect(result.startsWith(fragment)).toBe(true);
    expect(result).toContain("canvas-bridge-script");
  });

  it("produces valid bridge script syntax", () => {
    const result = buildCanvasBridgeDocument(sampleHtml, { canEdit: true });
    const match = result.match(
      /<script id="canvas-bridge-script">([\s\S]*?)<\/script>/,
    );
    expect(match?.[1]).toBeDefined();
    expect(() => new Function(match![1]!)).not.toThrow();
  });
});

describe("isBlockSelectMessage", () => {
  it("accepts valid block-select messages", () => {
    expect(
      isBlockSelectMessage({ type: "block-select", blockId: "heading-1" }),
    ).toBe(true);
  });

  it("rejects invalid messages", () => {
    expect(isBlockSelectMessage(null)).toBe(false);
    expect(isBlockSelectMessage({ type: "select-block", blockId: "x" })).toBe(
      false,
    );
    expect(isBlockSelectMessage({ type: "block-select", blockId: 1 })).toBe(
      false,
    );
  });
});

describe("isBlockEditStartMessage", () => {
  it("accepts valid block-edit-start messages", () => {
    expect(
      isBlockEditStartMessage({ type: "block-edit-start", blockId: "text-1" }),
    ).toBe(true);
  });

  it("accepts richtext edit-start messages", () => {
    expect(
      isBlockEditStartMessage({
        type: "block-edit-start",
        blockId: "richtext-1",
        editKind: "richtext",
      }),
    ).toBe(true);
  });
});

describe("isBlockEditSyncMessage", () => {
  it("accepts valid block-edit-sync messages", () => {
    expect(
      isBlockEditSyncMessage({
        type: "block-edit-sync",
        blockId: "richtext-1",
        prop: "html",
        value: "<p>Hi</p>",
      }),
    ).toBe(true);
  });
});

describe("isBlockEditCommitMessage", () => {
  it("accepts valid block-edit-commit messages", () => {
    expect(
      isBlockEditCommitMessage({
        type: "block-edit-commit",
        blockId: "text-1",
        prop: "text",
        value: "Updated",
      }),
    ).toBe(true);
  });
});

describe("isBlockEditCancelMessage", () => {
  it("accepts valid block-edit-cancel messages", () => {
    expect(
      isBlockEditCancelMessage({
        type: "block-edit-cancel",
        blockId: "richtext-1",
      }),
    ).toBe(true);
  });

  it("rejects messages without a block id", () => {
    expect(isBlockEditCancelMessage({ type: "block-edit-cancel" })).toBe(false);
  });
});

describe("isCanvasDropTargetMessage", () => {
  it("accepts valid drop-target messages", () => {
    expect(
      isCanvasDropTargetMessage({
        type: "canvas-drop-target",
        target: { kind: "body", index: 0 },
      }),
    ).toBe(true);
    expect(
      isCanvasDropTargetMessage({
        type: "canvas-drop-target",
        target: null,
      }),
    ).toBe(true);
  });

  it("accepts the dragKind and dragBlockId the runtime sends", () => {
    expect(
      isCanvasDropTargetMessage({
        type: "canvas-drop-target",
        target: { kind: "body", index: 0 },
        dragKind: "section",
        dragBlockId: "section-1",
      }),
    ).toBe(true);
    expect(
      isCanvasDropTargetMessage({
        type: "canvas-drop-target",
        target: { kind: "body", index: 0 },
        dragKind: null,
        dragBlockId: null,
      }),
    ).toBe(true);
  });

  it("rejects malformed drop-target messages", () => {
    expect(
      isCanvasDropTargetMessage({
        type: "canvas-drop-target",
        target: { kind: "column", index: 0 },
      }),
    ).toBe(false);
  });

  it("rejects an unknown dragKind before it reaches canDropAtTarget", () => {
    expect(
      isCanvasDropTargetMessage({
        type: "canvas-drop-target",
        target: { kind: "body", index: 0 },
        dragKind: "evil",
      }),
    ).toBe(false);
    expect(
      isCanvasDropTargetMessage({
        type: "canvas-drop-target",
        target: { kind: "body", index: 0 },
        dragBlockId: 42,
      }),
    ).toBe(false);
  });
});

describe("isRichtextFormatStateMessage", () => {
  it("accepts valid richtext-format-state messages", () => {
    expect(
      isRichtextFormatStateMessage({
        type: "richtext-format-state",
        blockId: "richtext-1",
        state: { bold: true, italic: false, underline: false, heading: "h2" },
      }),
    ).toBe(true);
  });

  it("rejects messages with a malformed state", () => {
    expect(
      isRichtextFormatStateMessage({
        type: "richtext-format-state",
        blockId: "richtext-1",
        state: { bold: "yes", italic: false, underline: false, heading: "p" },
      }),
    ).toBe(false);
  });
});
