import { describe, expect, it } from "vitest";
import { addContentBlock, createEmptyTemplateContent, moveContentBlock } from "@repo/shared";
import { applyBuilderMutation } from "./apply-builder-mutation";

describe("applyBuilderMutation", () => {
  const baseState = {
    content: createEmptyTemplateContent(),
    saveState: "synced" as const,
    selectedBlockId: null,
    inspectorMode: "templateSettings" as const,
  };

  it("returns null for unchanged tree outcomes", () => {
    const columnId = baseState.content.body[0]!.children[0]!.children[0]!.id;
    const outcome = moveContentBlock(
      baseState.content,
      "missing-block",
      columnId,
      0,
    );

    expect(applyBuilderMutation(baseState, outcome)).toBeNull();
  });

  it("marks working copy unsaved and selects inserted blocks", () => {
    const columnId = baseState.content.body[0]!.children[0]!.children[0]!.id;
    const outcome = addContentBlock(baseState.content, columnId, "heading");

    expect(applyBuilderMutation(baseState, outcome, { selectInsertedBlock: true })).toEqual({
      content: outcome.content,
      saveState: "unsaved",
      selectedBlockId: outcome.blockId,
      inspectorMode: "block",
    });
  });

  it("does not select a block id when insert failed", () => {
    const outcome = addContentBlock(baseState.content, "missing-column", "heading");

    expect(applyBuilderMutation(baseState, outcome, { selectInsertedBlock: true })).toBeNull();
  });
});
