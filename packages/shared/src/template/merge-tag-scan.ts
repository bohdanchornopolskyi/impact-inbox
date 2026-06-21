import type { ContentBlock } from "../schemas/template/blocks/content";
import type { TemplateContentData } from "../schemas/template/content";
import { TEMPLATE_BLOCK_DEFINITIONS } from "../constants";
import {
  findUnknownMergeTags,
  PHASE2_KNOWN_MERGE_TAG_NAMES,
} from "./merge-tags";

// Recursively collects every string leaf found under a prop value. This lets
// the registry-driven scanner reach text nested inside footer `links` (the
// `text` and `href` of each link) and table `columns`/`rows` without a
// per-type switch.
function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}

function collectBlockTexts(block: ContentBlock): string[] {
  const { mergeTagProps } = TEMPLATE_BLOCK_DEFINITIONS[block.type];
  const props = block.props as Record<string, unknown>;

  return mergeTagProps.flatMap((prop) => collectStrings(props[prop]));
}

export function collectMergeTagSourceTexts(
  content: TemplateContentData,
): string[] {
  const texts: string[] = [];
  const { settings } = content;

  if (settings.subject) {
    texts.push(settings.subject);
  }

  if (settings.preheader) {
    texts.push(settings.preheader);
  }

  for (const section of content.body) {
    for (const row of section.children) {
      for (const column of row.children) {
        for (const block of column.children) {
          texts.push(...collectBlockTexts(block));
        }
      }
    }
  }

  return texts;
}

export function findUnknownMergeTagsInContent(
  content: TemplateContentData,
  knownTags: ReadonlySet<string> = PHASE2_KNOWN_MERGE_TAG_NAMES,
): string[] {
  return findUnknownMergeTags(collectMergeTagSourceTexts(content), knownTags);
}
