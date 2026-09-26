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

export const EMPTY_SECTION_SAVE_ERROR =
  "Choose a section that has content before saving.";

export function suggestedSaveName(section: SectionBlock): string {
  for (const row of section.children) {
    for (const column of row.children) {
      for (const block of column.children) {
        if (block.type === "heading") {
          const text = block.props.text.trim();
          if (text) {
            return text.slice(0, 120);
          }
        }
      }
    }
  }
  return "Section";
}
