import { describe, expect, it } from "vitest";
import {
  buildCanvasBridgeDocument,
  isBlockEditCommitMessage,
  isBlockEditStartMessage,
  isBlockSelectMessage,
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
    expect(result).toContain("contentEditable");
    expect(result).toContain("resolveElement");
    expect(result).toContain("findEditableTarget");
    expect(result).toContain("findEditableElement");
    expect(result).toContain("dblclick");
    expect(result).toContain("setTimeout(function ()");
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
