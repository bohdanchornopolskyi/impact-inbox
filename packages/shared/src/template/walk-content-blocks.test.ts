import { describe, expect, it } from "vitest";
import { createEmptyTemplateContent } from "./create-block";
import { addContentBlock, addColumn, addRow } from "./tree-ops";
import {
  buildColumnBlockIdMap,
  walkContentBlocks,
  walkRows,
} from "./walk-content-blocks";

describe("walkContentBlocks", () => {
  it("visits nothing in an empty tree", () => {
    const content = createEmptyTemplateContent();
    content.body = [];
    const visited: string[] = [];
    walkContentBlocks(content, ({ block }) => {
      visited.push(block.id);
    });
    expect(visited).toEqual([]);
  });

  it("visits nested content blocks in document order", () => {
    let content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    content = addRow(content, sectionId).content;
    content = addColumn(content, content.body[0]!.children[0]!.id).content;

    const firstColumnId = content.body[0]!.children[0]!.children[0]!.id;
    const secondColumnId = content.body[0]!.children[0]!.children[1]!.id;

    content = addContentBlock(content, firstColumnId, "heading").content;
    content = addContentBlock(content, firstColumnId, "text").content;
    content = addContentBlock(content, secondColumnId, "button").content;

    const visited: string[] = [];
    walkContentBlocks(content, ({ block, column }) => {
      visited.push(`${column.id}:${block.type}`);
    });

    expect(visited).toEqual([
      `${firstColumnId}:heading`,
      `${firstColumnId}:text`,
      `${secondColumnId}:button`,
    ]);
  });

  it("builds column block id maps", () => {
    let content = createEmptyTemplateContent();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;
    content = addContentBlock(content, columnId, "heading").content;
    content = addContentBlock(content, columnId, "text").content;

    const map = buildColumnBlockIdMap(content);
    const ids = map.get(columnId)?.map((id) => {
      const found = content.body[0]!.children[0]!.children[0]!.children.find(
        (block) => block.id === id,
      );
      return found?.type;
    });

    expect(ids).toEqual(["heading", "text"]);
  });
});

describe("walkRows", () => {
  it("visits rows across sections", () => {
    let content = createEmptyTemplateContent();
    content = addRow(content, content.body[0]!.id).content;
    const rowIds: string[] = [];
    walkRows(content, ({ row }) => {
      rowIds.push(row.id);
    });
    expect(rowIds).toHaveLength(2);
  });
});
