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

  it("injects style and script before closing body", () => {
    const result = buildCanvasBridgeDocument(sampleHtml, { canEdit: true });

    expect(result).toContain('data-block-id="heading-1"');
    expect(result).toContain('<style id="canvas-bridge-styles">');
    expect(result).toContain("#canvas-bridge-layer");
    expect(result).toContain("canvas-bridge-hover");
    expect(result).toContain("canvas-bridge-toolbar");
    expect(result).toContain('<script id="canvas-bridge-script">');
    expect(result.indexOf("<style id=\"canvas-bridge-styles\">")).toBeLessThan(
      result.indexOf("</body>"),
    );
    expect(result.indexOf("<script id=\"canvas-bridge-script\">")).toBeLessThan(
      result.indexOf("</body>"),
    );
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
    expect(result).not.toContain('label === "Heading"');
    expect(result).toContain("startRichtextEdit");
    expect(result).toContain("resolveBlockLabel");
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
    expect(result).toContain("event.source !== window.parent");
    expect(result).toContain("data-layout-role");
    expect(result).toContain("resolveDropTarget");
    expect(result).toContain("canvas-drop-target");
    expect(result).toContain("data-canvas-empty-placeholder");
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

  it("rejects malformed drop-target messages", () => {
    expect(
      isCanvasDropTargetMessage({
        type: "canvas-drop-target",
        target: { kind: "column", index: 0 },
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
