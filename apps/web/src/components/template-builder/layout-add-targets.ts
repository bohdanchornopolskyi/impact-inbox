import {
  LAYOUT_BLOCK_TYPES,
  resolveRowId,
  resolveSectionId,
  type TemplateBlockType,
  type TemplateContentData,
} from "@repo/shared";

export type LayoutBlockType = (typeof LAYOUT_BLOCK_TYPES)[number];

const layoutBlockTypeSet = new Set<string>(LAYOUT_BLOCK_TYPES);

export function isLayoutBlockType(type: TemplateBlockType): boolean {
  return layoutBlockTypeSet.has(type);
}

export function resolveLayoutAddTargets(
  content: TemplateContentData,
  selectedBlockId: string | null,
) {
  return {
    sectionId: resolveSectionId(content, selectedBlockId),
    rowId: resolveRowId(content, selectedBlockId),
  };
}

export function addLayoutBlock(
  blockType: LayoutBlockType,
  content: TemplateContentData,
  selectedBlockId: string | null,
  actions: {
    addSection: () => void;
    addRow: (sectionId: string) => void;
    addColumn: (rowId: string) => void;
  },
): boolean {
  if (blockType === "section") {
    actions.addSection();
    return true;
  }

  const targets = resolveLayoutAddTargets(content, selectedBlockId);

  if (blockType === "row") {
    if (!targets.sectionId) {
      return false;
    }
    actions.addRow(targets.sectionId);
    return true;
  }

  if (!targets.rowId) {
    return false;
  }
  actions.addColumn(targets.rowId);
  return true;
}
