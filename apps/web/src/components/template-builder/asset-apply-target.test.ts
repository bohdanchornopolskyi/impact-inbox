import { describe, expect, it } from "vitest";
import {
  addContentBlock,
  ensureDefaultStructure,
  type TemplateContentData,
} from "@repo/shared";
import { canApplyAssetToSelection } from "./asset-apply-target";

function starter(): TemplateContentData {
  const content = ensureDefaultStructure({
    version: 1,
    settings: { width: 600 },
    body: [],
  });
  const columnId = content.body[0]!.children[0]!.children[0]!.id;
  const withHeading = addContentBlock(content, columnId, "heading").content;
  return addContentBlock(withHeading, columnId, "image").content;
}

describe("canApplyAssetToSelection", () => {
  it("is true for an editable image, logo, or section", () => {
    const content = starter();
    const sectionId = content.body[0]!.id;
    const headingId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;
    const imageId = content.body[0]!.children[0]!.children[0]!.children[1]!.id;

    expect(canApplyAssetToSelection(content, headingId, true)).toBe(false);
    expect(canApplyAssetToSelection(content, imageId, true)).toBe(true);
    expect(canApplyAssetToSelection(content, sectionId, true)).toBe(true);
    expect(canApplyAssetToSelection(content, imageId, false)).toBe(false);
    expect(canApplyAssetToSelection(content, null, true)).toBe(false);
  });
});
