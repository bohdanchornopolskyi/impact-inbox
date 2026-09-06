import { describe, expect, it } from "vitest";
import {
  addContentBlock,
  ensureDefaultStructure,
  moveContentBlock,
  updateBlockProps,
  updateBlockStyles,
  updateSettings,
  type TemplateContentData,
} from "@repo/shared";
import { getLayersTreeKey } from "./layers-tree";

function starter(): TemplateContentData {
  const content = ensureDefaultStructure({
    version: 1,
    settings: { width: 600 },
    body: [],
  });
  const columnId = content.body[0]!.children[0]!.children[0]!.id;
  return addContentBlock(content, columnId, "heading").content;
}

describe("getLayersTreeKey", () => {
  it("stays stable when heading text or styles change", () => {
    const content = starter();
    const headingId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;
    const nextText = updateBlockProps(content, headingId, { text: "Updated" });
    const nextStyles = updateBlockStyles(content, headingId, {
      backgroundColor: "#111111",
    });

    expect(getLayersTreeKey(nextText)).toBe(getLayersTreeKey(content));
    expect(getLayersTreeKey(nextStyles)).toBe(getLayersTreeKey(content));
  });

  it("stays stable when template settings change", () => {
    const content = starter();
    const next = updateSettings(content, { width: 640 });

    expect(getLayersTreeKey(next)).toBe(getLayersTreeKey(content));
  });

  it("changes when a block is added, moved, or removed", () => {
    const content = starter();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;
    const headingId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;
    const withButton = addContentBlock(content, columnId, "button").content;
    const moved = moveContentBlock(withButton, headingId, columnId, 1).content;

    expect(getLayersTreeKey(withButton)).not.toBe(getLayersTreeKey(content));
    expect(getLayersTreeKey(moved)).not.toBe(getLayersTreeKey(withButton));
  });
});
