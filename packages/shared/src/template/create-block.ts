import type { ContentBlockType } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
import type { ContentBlock } from "../schemas/template/blocks/content";
import type { TemplateContentData } from "../schemas/template/content";
import {
  DEFAULT_TEMPLATE_CONTENT,
  TEMPLATE_BLOCK_DEFINITIONS,
} from "../constants";

function createId(): string {
  return globalThis.crypto.randomUUID();
}

export function createSectionBlock(): SectionBlock {
  return {
    id: createId(),
    type: "section",
    props: {},
    children: [createRowBlock()],
  };
}

export function createRowBlock(): RowBlock {
  return {
    id: createId(),
    type: "row",
    props: {},
    children: [createColumnBlock()],
  };
}

export function createColumnBlock(): ColumnBlock {
  return {
    id: createId(),
    type: "column",
    props: {},
    children: [],
  };
}

export function createContentBlock(type: ContentBlockType): ContentBlock {
  const id = createId();
  const defaultProps = TEMPLATE_BLOCK_DEFINITIONS[type].defaultProps;

  return {
    id,
    type,
    // Defaults live in the block-definition registry (single source of truth);
    // the registry types them as `Record<string, unknown>`, so we structurally
    // re-cast to the discriminated `ContentBlock` here.
    props: structuredClone(defaultProps),
  } as ContentBlock;
}

export function ensureDefaultStructure(
  content: TemplateContentData,
): TemplateContentData {
  if (content.body.length > 0) {
    return content;
  }

  return {
    ...content,
    body: [createSectionBlock()],
  };
}

export function createEmptyTemplateContent(): TemplateContentData {
  return ensureDefaultStructure({ ...DEFAULT_TEMPLATE_CONTENT });
}
