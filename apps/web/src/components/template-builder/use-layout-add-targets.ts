"use client";

import { useBuilder } from "./builder-provider";
import {
  addLayoutBlock,
  type LayoutBlockType,
} from "./layout-add-targets";

export function useLayoutAddTargets() {
  const canEdit = useBuilder((s) => s.canEdit);
  const content = useBuilder((s) => s.content);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const addSection = useBuilder((s) => s.addSection);
  const addRow = useBuilder((s) => s.addRow);
  const addColumn = useBuilder((s) => s.addColumn);

  const actions = { addSection, addRow, addColumn };

  function handleAddLayoutBlock(blockType: LayoutBlockType) {
    if (!canEdit) {
      return;
    }
    addLayoutBlock(blockType, content, selectedBlockId, actions);
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
