import type { ContentBlockType } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
import type { ContentBlock } from "../schemas/template/blocks/content";
import type { TemplateContentData } from "../schemas/template/content";
import type { BlockStyles } from "../schemas/template/styles";
import type { TemplateBlockType } from "../constants/template";
import {
  DEFAULT_TEMPLATE_CONTENT,
  TEMPLATE_BLOCK_DEFINITIONS,
} from "../constants/template";

function createId(): string {
  return globalThis.crypto.randomUUID();
}

function cloneDefaultProps(type: TemplateBlockType): Record<string, unknown> {
  return structuredClone(TEMPLATE_BLOCK_DEFINITIONS[type].defaultProps);
}

function cloneDefaultStyles(type: TemplateBlockType): BlockStyles | undefined {
  const definition = TEMPLATE_BLOCK_DEFINITIONS[type] as {
    defaultStyles?: BlockStyles;
  };
  return definition.defaultStyles
    ? structuredClone(definition.defaultStyles)
    : undefined;
}

export function createSectionBlock(): SectionBlock {
  const styles = cloneDefaultStyles("section");
  return {
    id: createId(),
    type: "section",
    props: {},
    children: [createRowBlock()],
    ...(styles ? { styles } : {}),
  };
}

export function createRowBlock(): RowBlock {
  const styles = cloneDefaultStyles("row");
  return {
    id: createId(),
    type: "row",
    props: {},
    children: [createColumnBlock()],
    ...(styles ? { styles } : {}),
  };
}

export function createColumnBlock(): ColumnBlock {
  const styles = cloneDefaultStyles("column");
  return {
    id: createId(),
    type: "column",
    props: {},
    children: [],
    ...(styles ? { styles } : {}),
  };
}

export function createContentBlock(type: ContentBlockType): ContentBlock {
  const id = createId();
  const defaultProps = cloneDefaultProps(type);
  const styles = cloneDefaultStyles(type);

  return {
    id,
    type,
    props: defaultProps,
    ...(styles ? { styles } : {}),
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
  return ensureDefaultStructure({
    ...DEFAULT_TEMPLATE_CONTENT,
    settings: { ...DEFAULT_TEMPLATE_CONTENT.settings },
  });
}
