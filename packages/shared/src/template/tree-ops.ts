import type { ContentBlock } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
import type { TemplateContentData } from "../schemas/template/content";
import type { TemplateSettings } from "../schemas/template/settings";
import { templateSettingsSchema } from "../schemas/template/settings";
import { createContentBlock, createColumnBlock, createRowBlock, createSectionBlock } from "./create-block";

export type TemplateBlock =
  | SectionBlock
  | RowBlock
  | ColumnBlock
  | ContentBlock;

export type BlockPath = {
  sectionIndex: number;
  rowIndex?: number;
  columnIndex?: number;
  contentIndex?: number;
};

export type FoundBlock = {
  block: TemplateBlock;
  path: BlockPath;
  parentColumnId?: string;
};

export function isContentBlock(block: TemplateBlock): block is ContentBlock {
  return !["section", "row", "column"].includes(block.type);
}

export function findBlock(
  content: TemplateContentData,
  blockId: string,
): FoundBlock | undefined {
  for (let sectionIndex = 0; sectionIndex < content.body.length; sectionIndex += 1) {
    const section = content.body[sectionIndex];
    if (!section) {
      continue;
    }

    if (section.id === blockId) {
      return { block: section, path: { sectionIndex } };
    }

    for (let rowIndex = 0; rowIndex < section.children.length; rowIndex += 1) {
      const row = section.children[rowIndex];
      if (!row) {
        continue;
      }

      if (row.id === blockId) {
        return { block: row, path: { sectionIndex, rowIndex } };
      }

      for (let columnIndex = 0; columnIndex < row.children.length; columnIndex += 1) {
        const column = row.children[columnIndex];
        if (!column) {
          continue;
        }

        if (column.id === blockId) {
          return { block: column, path: { sectionIndex, rowIndex, columnIndex } };
        }

        for (let contentIndex = 0; contentIndex < column.children.length; contentIndex += 1) {
          const child = column.children[contentIndex];
          if (!child) {
            continue;
          }

          if (child.id === blockId) {
            return {
              block: child,
              path: { sectionIndex, rowIndex, columnIndex, contentIndex },
              parentColumnId: column.id,
            };
          }
        }
      }
    }
  }

  return undefined;
}

export function getFirstColumnId(content: TemplateContentData): string | undefined {
  const section = content.body[0];
  const row = section?.children[0];
  const column = row?.children[0];
  return column?.id;
}

export function resolveSectionId(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string | undefined {
  if (content.body.length === 0) {
    return undefined;
  }

  if (!selectedBlockId) {
    return content.body.at(-1)?.id;
  }

  const found = findBlock(content, selectedBlockId);
  if (!found) {
    return content.body.at(-1)?.id;
  }

  if (found.block.type === "section") {
    return found.block.id;
  }

  return content.body[found.path.sectionIndex]?.id;
}

export function resolveRowId(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string | undefined {
  if (!selectedBlockId) {
    const section = content.body.at(-1);
    return section?.children.at(-1)?.id ?? section?.children[0]?.id;
  }

  const found = findBlock(content, selectedBlockId);
  if (!found) {
    return undefined;
  }

  if (found.block.type === "row") {
    return found.block.id;
  }

  if (found.path.rowIndex !== undefined) {
    return content.body[found.path.sectionIndex]?.children[found.path.rowIndex]
      ?.id;
  }

  const section = content.body[found.path.sectionIndex];
  return section?.children.at(-1)?.id ?? section?.children[0]?.id;
}

export function resolveTargetColumnId(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string | undefined {
  if (!selectedBlockId) {
    return getFirstColumnId(content);
  }

  const found = findBlock(content, selectedBlockId);
  if (!found) {
    return getFirstColumnId(content);
  }

  if (found.block.type === "column") {
    return found.block.id;
  }

  return found.parentColumnId ?? getFirstColumnId(content);
}

function mapSections(
  content: TemplateContentData,
  mapper: (section: SectionBlock, sectionIndex: number) => SectionBlock,
): TemplateContentData {
  return {
    ...content,
    body: content.body.map(mapper),
  };
}

export function updateSettings(
  content: TemplateContentData,
  settings: Partial<TemplateSettings>,
): TemplateContentData {
  const merged = templateSettingsSchema.parse({
    ...content.settings,
    ...settings,
  });

  return {
    ...content,
    settings: merged,
  };
}

export function updateBlockProps(
  content: TemplateContentData,
  blockId: string,
  props: Record<string, unknown>,
): TemplateContentData {
  return mapSections(content, (section) => {
    if (section.id === blockId) {
      return { ...section, props: { ...section.props, ...props } };
    }

    return {
      ...section,
      children: section.children.map((row) => {
        if (row.id === blockId) {
          return { ...row, props: { ...row.props, ...props } };
        }

        return {
          ...row,
          children: row.children.map((column) => {
            if (column.id === blockId) {
              return { ...column, props: { ...column.props, ...props } };
            }

            return {
              ...column,
              children: column.children.map((child) =>
                child.id === blockId
                  ? ({ ...child, props: { ...child.props, ...props } } as ContentBlock)
                  : child,
              ),
            };
          }),
        };
      }),
    };
  });
}

function insertContentBlock(
  column: ColumnBlock,
  block: ContentBlock,
  index?: number,
): ColumnBlock {
  const children = [...column.children];
  const targetIndex =
    index === undefined ? children.length : Math.max(0, Math.min(index, children.length));
  children.splice(targetIndex, 0, block);

  return {
    ...column,
    children,
  };
}

export function addContentBlock(
  content: TemplateContentData,
  columnId: string,
  blockType: ContentBlock["type"],
  index?: number,
): TemplateContentData {
  const block = createContentBlock(blockType);

  return mapSections(content, (section) => ({
    ...section,
    children: section.children.map((row) => ({
      ...row,
      children: row.children.map((column) =>
        column.id === columnId ? insertContentBlock(column, block, index) : column,
      ),
    })),
  }));
}

export function addSection(
  content: TemplateContentData,
  index?: number,
): TemplateContentData {
  const section = createSectionBlock();
  const body = [...content.body];
  const targetIndex =
    index === undefined ? body.length : Math.max(0, Math.min(index, body.length));
  body.splice(targetIndex, 0, section);

  return { ...content, body };
}

export function addRow(
  content: TemplateContentData,
  sectionId: string,
  index?: number,
): TemplateContentData {
  const row = createRowBlock();

  return mapSections(content, (section) => {
    if (section.id !== sectionId) {
      return section;
    }

    const children = [...section.children];
    const targetIndex =
      index === undefined ? children.length : Math.max(0, Math.min(index, children.length));
    children.splice(targetIndex, 0, row);

    return { ...section, children };
  });
}

export function addColumn(
  content: TemplateContentData,
  rowId: string,
  index?: number,
): TemplateContentData {
  const column = createColumnBlock();

  return mapSections(content, (section) => ({
    ...section,
    children: section.children.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      const children = [...row.children];
      const targetIndex =
        index === undefined ? children.length : Math.max(0, Math.min(index, children.length));
      children.splice(targetIndex, 0, column);

      return { ...row, children };
    }),
  }));
}

export function removeBlock(
  content: TemplateContentData,
  blockId: string,
): TemplateContentData {
  const found = findBlock(content, blockId);
  if (!found) {
    return content;
  }

  const { path } = found;

  if (path.contentIndex !== undefined) {
    return mapSections(content, (section, sectionIndex) => {
      if (sectionIndex !== path.sectionIndex) {
        return section;
      }

      return {
        ...section,
        children: section.children.map((row, rowIndex) => {
          if (rowIndex !== path.rowIndex) {
            return row;
          }

          return {
            ...row,
            children: row.children.map((column, columnIndex) => {
              if (columnIndex !== path.columnIndex) {
                return column;
              }

              return {
                ...column,
                children: column.children.filter((_, i) => i !== path.contentIndex),
              };
            }),
          };
        }),
      };
    });
  }

  if (path.columnIndex !== undefined) {
    return mapSections(content, (section, sectionIndex) => {
      if (sectionIndex !== path.sectionIndex) {
        return section;
      }

      return {
        ...section,
        children: section.children.map((row, rowIndex) => {
          if (rowIndex !== path.rowIndex) {
            return row;
          }

          const columns = row.children.filter((_, i) => i !== path.columnIndex);
          if (columns.length === 0) {
            return row;
          }

          return { ...row, children: columns };
        }),
      };
    });
  }

  if (path.rowIndex !== undefined) {
    return mapSections(content, (section, sectionIndex) => {
      if (sectionIndex !== path.sectionIndex) {
        return section;
      }

      const rows = section.children.filter((_, i) => i !== path.rowIndex);
      if (rows.length === 0) {
        return section;
      }

      return { ...section, children: rows };
    });
  }

  const body = content.body.filter((_, i) => i !== path.sectionIndex);
  return { ...content, body };
}

function arrayMove<T>(array: readonly T[], from: number, to: number): T[] {
  const result = [...array];
  result.splice(to, 0, result.splice(from, 1)[0]!);
  return result;
}

export function moveContentBlock(
  content: TemplateContentData,
  blockId: string,
  targetColumnId: string,
  targetIndex: number,
): TemplateContentData {
  const found = findBlock(content, blockId);
  if (!found || !isContentBlock(found.block)) {
    return content;
  }

  const sourceIndex = found.path.contentIndex;
  if (sourceIndex === undefined) {
    return content;
  }

  const sourceColumnId = found.parentColumnId;
  const block = found.block;

  if (sourceColumnId === targetColumnId) {
    return mapSections(content, (section) => ({
      ...section,
      children: section.children.map((row) => ({
        ...row,
        children: row.children.map((column) => {
          if (column.id !== targetColumnId) {
            return column;
          }

          return {
            ...column,
            children: arrayMove(column.children, sourceIndex, targetIndex),
          };
        }),
      })),
    }));
  }

  const withoutBlock = removeBlock(content, blockId);

  return mapSections(withoutBlock, (section) => ({
    ...section,
    children: section.children.map((row) => ({
      ...row,
      children: row.children.map((column) =>
        column.id === targetColumnId
          ? insertContentBlock(column, block, targetIndex)
          : column,
      ),
    })),
  }));
}

export { ensureDefaultStructure } from "./create-block";
