import {
  findBlock,
  isEmptyModuleSection,
  resolveSectionId,
  type SectionBlock,
  type TemplateContentData,
} from "@repo/shared";

export type ModuleSaveTargetState = "none" | "empty" | "ready";

export function moduleSaveTargetState(
  content: TemplateContentData,
  selectedBlockId: string | null,
): ModuleSaveTargetState {
  const section = resolveSelectedSection(content, selectedBlockId);
  if (!section) {
    return "none";
  }

  return isEmptyModuleSection(section) ? "empty" : "ready";
}

export function resolveSelectedSection(
  content: TemplateContentData,
  selectedBlockId: string | null,
): SectionBlock | undefined {
  const sectionId = resolveSectionId(content, selectedBlockId);
  if (!sectionId) {
    return undefined;
  }

  const found = findBlock(content, sectionId);
  return found?.block.type === "section" ? found.block : undefined;
}
