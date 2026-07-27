import { describe, expect, it } from "vitest";
import { createEmptyTemplateContent } from "./create-block";
import {
  addContentBlock,
  getFirstColumnId,
  updateBlockProps,
} from "./tree-ops";
import { templateContentUsesAssetUrl, stripAssetUrlFromContent } from "./asset-url-usage";

describe("templateContentUsesAssetUrl", () => {
  it("detects image src usage", () => {
    const url = "https://cdn.example.com/orgs/a/assets/1.png";
    const content = createEmptyTemplateContent();
    const columnId = getFirstColumnId(content);
    expect(columnId).toBeDefined();

    const inserted = addContentBlock(content, columnId!, "image");
    expect(inserted.blockId).toBeDefined();
    const withUrl = updateBlockProps(inserted.content, inserted.blockId!, {
      src: url,
    });

    expect(templateContentUsesAssetUrl(withUrl, url)).toBe(true);
    expect(
      templateContentUsesAssetUrl(withUrl, "https://cdn.example.com/other.png"),
    ).toBe(false);

    const stripped = stripAssetUrlFromContent(withUrl, url);
    expect(templateContentUsesAssetUrl(stripped, url)).toBe(false);
  });
});
