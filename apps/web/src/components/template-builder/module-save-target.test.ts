import { describe, expect, it } from "vitest";
import {
  addContentBlock,
  ensureDefaultStructure,
  updateBlockProps,
  type TemplateContentData,
} from "@repo/shared";
import { moduleSaveTargetState } from "./module-save-target";

function emptySection(): TemplateContentData {
  return ensureDefaultStructure({
    version: 1,
    settings: { width: 600 },
    body: [],
  });
}

describe("moduleSaveTargetState", () => {
  it("stays ready when heading text changes inside the selected section", () => {
    let content = emptySection();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;
    content = addContentBlock(content, columnId, "heading").content;
    const headingId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;
    const next = updateBlockProps(content, headingId, { text: "Updated" });

    expect(moduleSaveTargetState(content, headingId)).toBe("ready");
    expect(moduleSaveTargetState(next, headingId)).toBe("ready");
  });

  it("is empty until the selected section has a content block", () => {
    const content = emptySection();
    const sectionId = content.body[0]!.id;

    expect(moduleSaveTargetState(content, sectionId)).toBe("empty");
  });
});
