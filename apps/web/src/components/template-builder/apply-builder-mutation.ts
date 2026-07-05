import type { TreeMutationResult } from "@repo/shared";
import type { InspectorMode, SaveState } from "./builder-provider";

type BuilderMutationSlice = {
  content: TreeMutationResult["content"];
  saveState: SaveState;
  selectedBlockId: string | null;
  inspectorMode: InspectorMode;
};

export function applyBuilderMutation(
  state: BuilderMutationSlice,
  outcome: TreeMutationResult,
  options?: { selectInsertedBlock?: boolean },
): BuilderMutationSlice | null {
  if (!outcome.changed) {
    return null;
  }

  return {
    content: outcome.content,
    saveState: "unsaved",
    selectedBlockId:
      options?.selectInsertedBlock && outcome.blockId
        ? outcome.blockId
        : state.selectedBlockId,
    inspectorMode:
      options?.selectInsertedBlock && outcome.blockId
        ? "block"
        : state.inspectorMode,
  };
}
