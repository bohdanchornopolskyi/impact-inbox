import { describe, expect, it } from "vitest";
import { createEmptyTemplateContent } from "./create-block";
import {
  collectMergeTagSourceTexts,
  findUnknownMergeTagsInContent,
} from "./merge-tag-scan";
import { addContentBlock } from "./tree-ops";

describe("merge-tag-scan", () => {
  it("collects subject and block text fields", () => {
    let content = createEmptyTemplateContent();
    content = {
      ...content,
      settings: {
        ...content.settings,
        subject: "Hi {{firstName}}",
        preheader: "{{workspaceName}}",
      },
    };
    const columnId = content.body[0]?.children[0]?.children[0]?.id;
    if (!columnId) {
      throw new Error("missing column");
    }
    content = addContentBlock(content, columnId, "heading");

    const texts = collectMergeTagSourceTexts(content);
    expect(texts).toContain("Hi {{firstName}}");
    expect(texts).toContain("{{workspaceName}}");
  });

  it("flags unknown tags against phase 2 allowlist", () => {
    let content = createEmptyTemplateContent();
    content = {
      ...content,
      settings: {
        ...content.settings,
        subject: "Hello {{firstName}} and {{companyName}}",
      },
    };

    expect(findUnknownMergeTagsInContent(content)).toEqual(["companyName"]);
  });

  it("returns empty when all tags are known", () => {
    const content = {
      ...createEmptyTemplateContent(),
      settings: {
        ...createEmptyTemplateContent().settings,
        subject: "{{email}} — {{unsubscribeUrl}}",
      },
    };

    expect(findUnknownMergeTagsInContent(content)).toEqual([]);
  });
});
