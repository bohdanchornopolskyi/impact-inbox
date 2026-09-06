"use client";

import { useBuilderStore } from "./builder-provider";
import {
  addLayoutBlock,
  type LayoutBlockType,
} from "./layout-add-targets";

export function useLayoutAddTargets() {
  const store = useBuilderStore();

  function handleAddLayoutBlock(blockType: LayoutBlockType) {
    const state = store.getState();
    if (!state.canEdit) {
      return;
    }
    addLayoutBlock(blockType, state.content, state.selectedBlockId, {
      addSection: state.addSection,
      addRow: state.addRow,
      addColumn: state.addColumn,
    });
  }

  function handleAddSection() {
    handleAddLayoutBlock("section");
  }

  function handleAddRow() {
    handleAddLayoutBlock("row");
  }

  function handleAddColumn() {
    handleAddLayoutBlock("column");
  }

  return {
    handleAddLayoutBlock,
    handleAddSection,
    handleAddRow,
    handleAddColumn,
  };
}
