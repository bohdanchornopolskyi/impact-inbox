import type { ContentBlock } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
import type { TemplateContentData } from "../schemas/template/content";
import type { TemplateSettings } from "../schemas/template/settings";
import type { BlockStyles } from "../schemas/template/styles";
import type { BrandKitData } from "../schemas/brand-kit";
import { templateSettingsSchema } from "../schemas/template/settings";
import { createContentBlock, createColumnBlock, createRowBlock, createSectionBlock } from "./create-block";
import { cloneBlockWithNewIds } from "./clone-block";
import { rowWithRedistributedColumnWidths } from "./column-widths";

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

export type TreeMutationReason =
  | "noop"
  | "block_not_found"
  | "parent_not_found"
  | "invalid_block_type"
  | "invalid_target"
  | "descendant_move";

export type TreeMutationResult = {
  content: TemplateContentData;
  changed: boolean;
  reason?: TreeMutationReason;
  blockId?: string;
};

function unchanged(
  content: TemplateContentData,
  reason: TreeMutationReason,
): TreeMutationResult {
  return { content, changed: false, reason };
}

function changed(
  content: TemplateContentData,
  blockId?: string,
): TreeMutationResult {
  return { content, changed: true, blockId };
}

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

function mergeBlockStyles(
  block: { styles?: BlockStyles },
  styles: Partial<BlockStyles>,
): BlockStyles | undefined {
  const merged: Record<string, unknown> = { ...(block.styles ?? {}) };

  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined) {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  }

  return Object.keys(merged).length > 0 ? (merged as BlockStyles) : undefined;
}

export function updateBlockStyles(
  content: TemplateContentData,
  blockId: string,
  styles: Partial<BlockStyles>,
): TemplateContentData {
  return mapSections(content, (section) => {
    if (section.id === blockId) {
      return { ...section, styles: mergeBlockStyles(section, styles) };
    }

    return {
      ...section,
      children: section.children.map((row) => {
        if (row.id === blockId) {
          return { ...row, styles: mergeBlockStyles(row, styles) };
        }

        return {
          ...row,
          children: row.children.map((column) => {
            if (column.id === blockId) {
              return { ...column, styles: mergeBlockStyles(column, styles) };
            }

            return {
              ...column,
              children: column.children.map((child) =>
                child.id === blockId
                  ? ({ ...child, styles: mergeBlockStyles(child, styles) } as ContentBlock)
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

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length));
}

export function addContentBlock(
  content: TemplateContentData,
  columnId: string,
  blockType: ContentBlock["type"],
  index?: number,
  brandKit?: BrandKitData | null,
): TreeMutationResult {
  const targetColumn = findBlock(content, columnId);
  if (!targetColumn || targetColumn.block.type !== "column") {
    return unchanged(content, "parent_not_found");
  }

  const block = createContentBlock(blockType, brandKit);

  return changed(
    mapSections(content, (section) => ({
      ...section,
      children: section.children.map((row) => ({
        ...row,
        children: row.children.map((column) =>
          column.id === columnId ? insertContentBlock(column, block, index) : column,
        ),
      })),
    })),
    block.id,
  );
}

export function addSection(
  content: TemplateContentData,
  index?: number,
  brandKit?: BrandKitData | null,
): TreeMutationResult {
  const section = createSectionBlock(brandKit);
  return insertSection(content, section, index);
}

export function insertSection(
  content: TemplateContentData,
  section: SectionBlock,
  index?: number,
): TreeMutationResult {
  const body = [...content.body];
  const targetIndex =
    index === undefined ? body.length : clampIndex(index, body.length);
  body.splice(targetIndex, 0, section);

  return changed({ ...content, body }, section.id);
}

export function addRow(
  content: TemplateContentData,
  sectionId: string,
  index?: number,
  brandKit?: BrandKitData | null,
): TreeMutationResult {
  const targetSection = findBlock(content, sectionId);
  if (!targetSection || targetSection.block.type !== "section") {
    return unchanged(content, "parent_not_found");
  }

  const row = createRowBlock(brandKit);

  return changed(
    mapSections(content, (section) => {
      if (section.id !== sectionId) {
        return section;
      }

      const children = [...section.children];
      const targetIndex =
        index === undefined ? children.length : clampIndex(index, children.length);
      children.splice(targetIndex, 0, row);

      return { ...section, children };
    }),
    row.id,
  );
}

export function addColumn(
  content: TemplateContentData,
  rowId: string,
  index?: number,
  brandKit?: BrandKitData | null,
): TreeMutationResult {
  const targetRow = findBlock(content, rowId);
  if (!targetRow || targetRow.block.type !== "row") {
    return unchanged(content, "parent_not_found");
  }

  const column = createColumnBlock(brandKit);

  return changed(
    mapSections(content, (section) => ({
      ...section,
      children: section.children.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const children = [...row.children];
        const targetIndex =
          index === undefined ? children.length : clampIndex(index, children.length);
        children.splice(targetIndex, 0, column);

        return rowWithRedistributedColumnWidths({ ...row, children });
      }),
    })),
    column.id,
  );
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

          return rowWithRedistributedColumnWidths({ ...row, children: columns });
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

/**
 * Inserts a copy of a block directly after the original, with fresh ids across the
 * whole subtree. Duplicating a column redistributes the row's column widths.
 */
export function duplicateBlock(
  content: TemplateContentData,
  blockId: string,
): TreeMutationResult {
  const found = findBlock(content, blockId);
  if (!found) {
    return unchanged(content, "block_not_found");
  }

  const { block, path } = found;

  if (block.type === "section") {
    const clone = cloneBlockWithNewIds(block);
    return changed(
      insertSectionAt(content, clone, path.sectionIndex + 1),
      clone.id,
    );
  }

  if (block.type === "row" && path.rowIndex !== undefined) {
    const sectionId = content.body[path.sectionIndex]?.id;
    if (!sectionId) {
      return unchanged(content, "parent_not_found");
    }

    const clone = cloneBlockWithNewIds(block);
    return changed(
      insertRowAt(content, sectionId, clone, path.rowIndex + 1),
      clone.id,
    );
  }

  if (
    block.type === "column" &&
    path.rowIndex !== undefined &&
    path.columnIndex !== undefined
  ) {
    const rowId = content.body[path.sectionIndex]?.children[path.rowIndex]?.id;
    if (!rowId) {
      return unchanged(content, "parent_not_found");
    }

    const clone = cloneBlockWithNewIds(block);
    return changed(
      insertColumnAt(content, rowId, clone, path.columnIndex + 1),
      clone.id,
    );
  }

  if (
    !isContentBlock(block) ||
    !found.parentColumnId ||
    path.contentIndex === undefined
  ) {
    return unchanged(content, "block_not_found");
  }

  const columnId = found.parentColumnId;
  const targetIndex = path.contentIndex + 1;
  const clone = cloneBlockWithNewIds(block);

  return changed(
    mapSections(content, (section) => ({
      ...section,
      children: section.children.map((row) => ({
        ...row,
        children: row.children.map((column) =>
          column.id === columnId
            ? insertContentBlock(column, clone, targetIndex)
            : column,
        ),
      })),
    })),
    clone.id,
  );
}

function arrayMove<T>(array: readonly T[], from: number, to: number): T[] {
  const result = [...array];
  result.splice(to, 0, result.splice(from, 1)[0]!);
  return result;
}

export function isDescendantOf(
  content: TemplateContentData,
  ancestorId: string,
  blockId: string,
): boolean {
  if (ancestorId === blockId) {
    return true;
  }

  const ancestor = findBlock(content, ancestorId);
  if (!ancestor) {
    return false;
  }

  function walk(block: TemplateBlock): boolean {
    if (block.id === blockId) {
      return true;
    }

    if (block.type === "section") {
      return block.children.some(walk);
    }

    if (block.type === "row") {
      return block.children.some(walk);
    }

    if (block.type === "column") {
      return block.children.some(walk);
    }

    return false;
  }

  return walk(ancestor.block);
}

function extractSection(
  content: TemplateContentData,
  sectionId: string,
): { content: TemplateContentData; block: SectionBlock } | undefined {
  const found = findBlock(content, sectionId);
  if (!found || found.block.type !== "section") {
    return undefined;
  }

  return {
    block: found.block,
    content: {
      ...content,
      body: content.body.filter((section) => section.id !== sectionId),
    },
  };
}

function extractRow(
  content: TemplateContentData,
  rowId: string,
): { content: TemplateContentData; block: RowBlock } | undefined {
  const found = findBlock(content, rowId);
  if (!found || found.block.type !== "row" || found.path.rowIndex === undefined) {
    return undefined;
  }

  const { sectionIndex, rowIndex } = found.path;

  return {
    block: found.block,
    content: mapSections(content, (section, index) => {
      if (index !== sectionIndex) {
        return section;
      }

      return {
        ...section,
        children: section.children.filter((_, childIndex) => childIndex !== rowIndex),
      };
    }),
  };
}

function extractColumn(
  content: TemplateContentData,
  columnId: string,
): { content: TemplateContentData; block: ColumnBlock } | undefined {
  const found = findBlock(content, columnId);
  if (
    !found ||
    found.block.type !== "column" ||
    found.path.rowIndex === undefined ||
    found.path.columnIndex === undefined
  ) {
    return undefined;
  }

  const { sectionIndex, rowIndex, columnIndex } = found.path;

  return {
    block: found.block,
    content: mapSections(content, (section, index) => {
      if (index !== sectionIndex) {
        return section;
      }

      return {
        ...section,
        children: section.children.map((row, currentRowIndex) => {
          if (currentRowIndex !== rowIndex) {
            return row;
          }

          return rowWithRedistributedColumnWidths({
            ...row,
            children: row.children.filter(
              (_, childIndex) => childIndex !== columnIndex,
            ),
          });
        }),
      };
    }),
  };
}

function insertSectionAt(
  content: TemplateContentData,
  section: SectionBlock,
  index: number,
): TemplateContentData {
  const body = [...content.body];
  body.splice(clampIndex(index, body.length), 0, section);
  return { ...content, body };
}

function insertRowAt(
  content: TemplateContentData,
  sectionId: string,
  row: RowBlock,
  index: number,
): TemplateContentData {
  return mapSections(content, (section) => {
    if (section.id !== sectionId) {
      return section;
    }

    const children = [...section.children];
    children.splice(clampIndex(index, children.length), 0, row);
    return { ...section, children };
  });
}

function insertColumnAt(
  content: TemplateContentData,
  rowId: string,
  column: ColumnBlock,
  index: number,
): TemplateContentData {
  return mapSections(content, (section) => ({
    ...section,
    children: section.children.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      const children = [...row.children];
      children.splice(clampIndex(index, children.length), 0, column);
      return rowWithRedistributedColumnWidths({ ...row, children });
    }),
  }));
}

export function moveSection(
  content: TemplateContentData,
  sectionId: string,
  targetIndex: number,
): TreeMutationResult {
  const found = findBlock(content, sectionId);
  if (!found || found.block.type !== "section") {
    return unchanged(content, "block_not_found");
  }

  const sourceIndex = found.path.sectionIndex;
  if (sourceIndex === targetIndex || sourceIndex + 1 === targetIndex) {
    return unchanged(content, "noop");
  }

  const extracted = extractSection(content, sectionId);
  if (!extracted) {
    return unchanged(content, "block_not_found");
  }

  const adjustedIndex =
    sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;

  return changed(
    insertSectionAt(extracted.content, extracted.block, adjustedIndex),
  );
}

export function moveRow(
  content: TemplateContentData,
  rowId: string,
  targetSectionId: string,
  targetIndex: number,
): TreeMutationResult {
  const found = findBlock(content, rowId);
  if (!found || found.block.type !== "row" || found.path.rowIndex === undefined) {
    return unchanged(content, "block_not_found");
  }

  const targetSection = findBlock(content, targetSectionId);
  if (!targetSection || targetSection.block.type !== "section") {
    return unchanged(content, "parent_not_found");
  }

  if (isDescendantOf(content, rowId, targetSectionId)) {
    return unchanged(content, "descendant_move");
  }

  const sourceSectionId = content.body[found.path.sectionIndex]?.id;
  if (!sourceSectionId) {
    return unchanged(content, "block_not_found");
  }

  if (sourceSectionId === targetSectionId) {
    const sourceIndex = found.path.rowIndex;
    if (sourceIndex === targetIndex || sourceIndex + 1 === targetIndex) {
      return unchanged(content, "noop");
    }

    return changed(
      mapSections(content, (section) => {
        if (section.id !== targetSectionId) {
          return section;
        }

        return {
          ...section,
          children: arrayMove(section.children, sourceIndex, targetIndex),
        };
      }),
    );
  }

  const extracted = extractRow(content, rowId);
  if (!extracted) {
    return unchanged(content, "block_not_found");
  }

  return changed(
    insertRowAt(
      extracted.content,
      targetSectionId,
      extracted.block,
      targetIndex,
    ),
  );
}

export function moveColumn(
  content: TemplateContentData,
  columnId: string,
  targetRowId: string,
  targetIndex: number,
): TreeMutationResult {
  const found = findBlock(content, columnId);
  if (
    !found ||
    found.block.type !== "column" ||
    found.path.rowIndex === undefined ||
    found.path.columnIndex === undefined
  ) {
    return unchanged(content, "block_not_found");
  }

  const targetRow = findBlock(content, targetRowId);
  if (!targetRow || targetRow.block.type !== "row") {
    return unchanged(content, "parent_not_found");
  }

  if (isDescendantOf(content, columnId, targetRowId)) {
    return unchanged(content, "descendant_move");
  }

  const sourceRowId =
    content.body[found.path.sectionIndex]?.children[found.path.rowIndex]?.id;
  if (!sourceRowId) {
    return unchanged(content, "block_not_found");
  }

  if (sourceRowId === targetRowId) {
    const sourceIndex = found.path.columnIndex;
    if (sourceIndex === targetIndex || sourceIndex + 1 === targetIndex) {
      return unchanged(content, "noop");
    }

    return changed(
      mapSections(content, (section) => ({
        ...section,
        children: section.children.map((row) => {
          if (row.id !== targetRowId) {
            return row;
          }

          return {
            ...row,
            children: arrayMove(row.children, sourceIndex, targetIndex),
          };
        }),
      })),
    );
  }

  const extracted = extractColumn(content, columnId);
  if (!extracted) {
    return unchanged(content, "block_not_found");
  }

  return changed(
    insertColumnAt(
      extracted.content,
      targetRowId,
      extracted.block,
      targetIndex,
    ),
  );
}

export function resolveStructurePanelContentTarget(
  content: TemplateContentData,
  activeId: string,
  target:
    | { kind: "append"; columnId: string }
    | { kind: "column"; columnId: string }
    | { kind: "content"; blockId: string },
): { columnId: string; index: number } | null {
  const activeFound = findBlock(content, activeId);
  if (!activeFound || !isContentBlock(activeFound.block)) {
    return null;
  }

  const sourceIndex = activeFound.path.contentIndex;
  if (sourceIndex === undefined) {
    return null;
  }

  if (target.kind === "append" || target.kind === "column") {
    const column = findBlock(content, target.columnId);
    if (!column || column.block.type !== "column") {
      return null;
    }

    const appendIndex =
      activeFound.parentColumnId === target.columnId
        ? Math.max(0, column.block.children.length - 1)
        : column.block.children.length;

    return {
      columnId: target.columnId,
      index: appendIndex,
    };
  }

  const overFound = findBlock(content, target.blockId);
  if (
    !overFound ||
    !isContentBlock(overFound.block) ||
    !overFound.parentColumnId ||
    overFound.path.contentIndex === undefined
  ) {
    return null;
  }

  return {
    columnId: overFound.parentColumnId,
    index: overFound.path.contentIndex,
  };
}

export function moveContentBlock(
  content: TemplateContentData,
  blockId: string,
  targetColumnId: string,
  targetIndex: number,
): TreeMutationResult {
  const found = findBlock(content, blockId);
  if (!found || !isContentBlock(found.block)) {
    return unchanged(content, "block_not_found");
  }

  const sourceIndex = found.path.contentIndex;
  if (sourceIndex === undefined) {
    return unchanged(content, "block_not_found");
  }

  const targetColumn = findBlock(content, targetColumnId);
  if (!targetColumn || targetColumn.block.type !== "column") {
    return unchanged(content, "parent_not_found");
  }

  const sourceColumnId = found.parentColumnId;
  const block = found.block;

  if (sourceColumnId === targetColumnId) {
    if (sourceIndex === targetIndex) {
      return unchanged(content, "noop");
    }

    return changed(
      mapSections(content, (section) => ({
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
      })),
    );
  }

  const withoutBlock = removeBlock(content, blockId);
  const clampedIndex = clampIndex(
    targetIndex,
    targetColumn.block.children.length,
  );

  return changed(
    mapSections(withoutBlock, (section) => ({
      ...section,
      children: section.children.map((row) => ({
        ...row,
        children: row.children.map((column) =>
          column.id === targetColumnId
            ? insertContentBlock(column, block, clampedIndex)
            : column,
        ),
      })),
    })),
  );
}

export { ensureDefaultStructure } from "./create-block";
