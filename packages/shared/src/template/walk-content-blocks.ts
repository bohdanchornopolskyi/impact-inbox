import type { ContentBlock } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
import type { TemplateContentData } from "../schemas/template/content";

export type ContentBlockWalkContext = {
  section: SectionBlock;
  sectionIndex: number;
  row: RowBlock;
  rowIndex: number;
  column: ColumnBlock;
  columnIndex: number;
  block: ContentBlock;
  blockIndex: number;
};

export type RowWalkContext = {
  section: SectionBlock;
  sectionIndex: number;
  row: RowBlock;
  rowIndex: number;
};

export function walkContentBlocks(
  content: TemplateContentData,
  visitor: (ctx: ContentBlockWalkContext) => void,
): void {
  for (let sectionIndex = 0; sectionIndex < content.body.length; sectionIndex += 1) {
    const section = content.body[sectionIndex];
    if (!section) {
      continue;
    }

    for (let rowIndex = 0; rowIndex < section.children.length; rowIndex += 1) {
      const row = section.children[rowIndex];
      if (!row) {
        continue;
      }

      for (let columnIndex = 0; columnIndex < row.children.length; columnIndex += 1) {
        const column = row.children[columnIndex];
        if (!column) {
          continue;
        }

        for (let blockIndex = 0; blockIndex < column.children.length; blockIndex += 1) {
          const block = column.children[blockIndex];
          if (!block) {
            continue;
          }

          visitor({
            section,
            sectionIndex,
            row,
            rowIndex,
            column,
            columnIndex,
            block,
            blockIndex,
          });
        }
      }
    }
  }
}

export function walkRows(
  content: TemplateContentData,
  visitor: (ctx: RowWalkContext) => void,
): void {
  for (let sectionIndex = 0; sectionIndex < content.body.length; sectionIndex += 1) {
    const section = content.body[sectionIndex];
    if (!section) {
      continue;
    }

    for (let rowIndex = 0; rowIndex < section.children.length; rowIndex += 1) {
      const row = section.children[rowIndex];
      if (!row) {
        continue;
      }

      visitor({ section, sectionIndex, row, rowIndex });
    }
  }
}

export function buildColumnBlockIdMap(
  content: TemplateContentData,
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  walkContentBlocks(content, ({ column, block }) => {
    const ids = map.get(column.id);
    if (ids) {
      ids.push(block.id);
      return;
    }
    map.set(column.id, [block.id]);
  });

  return map;
}
