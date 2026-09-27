import { findBlock, type TemplateContentData } from "@repo/shared";

export function canApplyAssetToSelection(
  content: TemplateContentData,
  selectedBlockId: string | null,
  canEdit: boolean,
): boolean {
  if (!canEdit || !selectedBlockId) {
    return false;
  }

  const found = findBlock(content, selectedBlockId);
  return (
    found?.block.type === "image" ||
    found?.block.type === "logo" ||
    found?.block.type === "section"
  );
}
