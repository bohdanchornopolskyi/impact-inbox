import { describe, expect, it } from "vitest";
import {
  addContentBlock,
  addColumn,
  addRow,
  addSection,
  ensureDefaultStructure,
  findBlock,
  isDescendantOf,
  moveColumn,
  moveContentBlock,
  moveRow,
  moveSection,
  removeBlock,
  updateBlockProps,
  updateSettings,
} from "./tree-ops";
import { createContentBlock, createEmptyTemplateContent } from "./create-block";

describe("tree-ops", () => {
  it("ensureDefaultStructure adds section row column skeleton", () => {
    const content = ensureDefaultStructure({
      version: 1,
      settings: { width: 600 },
      body: [],
    });

    expect(content.body).toHaveLength(1);
    expect(content.body[0]?.type).toBe("section");
    expect(content.body[0]?.children[0]?.type).toBe("row");
    expect(content.body[0]?.children[0]?.children[0]?.type).toBe("column");
  });

  it("adds and finds content blocks", () => {
    const base = createEmptyTemplateContent();
    const columnId = base.body[0]?.children[0]?.children[0]?.id;
    expect(columnId).toBeDefined();

    const withBlock = addContentBlock(base, columnId!, "heading");
    expect(withBlock.blockId).toBeTruthy();
    const heading = withBlock.content.body[0]?.children[0]?.children[0]?.children[0];
    expect(heading?.type).toBe("heading");
    expect(withBlock.blockId).toBe(heading?.id);

    const found = findBlock(withBlock.content, heading!.id);
    expect(found?.block.type).toBe("heading");
  });

  it("returns inserted block ids from layout insert helpers", () => {
    let content = createEmptyTemplateContent();

    const sectionResult = addSection(content);
    expect(sectionResult.blockId).toBe(sectionResult.content.body.at(-1)?.id);
    content = sectionResult.content;

    const rowResult = addRow(content, content.body[0]!.id);
    expect(rowResult.blockId).toBe(
      rowResult.content.body[0]!.children.at(-1)?.id,
    );
    content = rowResult.content;

    const columnResult = addColumn(content, content.body[0]!.children[0]!.id);
    expect(columnResult.blockId).toBe(
      columnResult.content.body[0]!.children[0]!.children.at(-1)?.id,
    );
  });

  it("updates settings and block props", () => {
    const base = createEmptyTemplateContent();
    const columnId = base.body[0]?.children[0]?.children[0]?.id!;
    const withBlock = addContentBlock(base, columnId, "text");
    const blockId = withBlock.content.body[0]?.children[0]?.children[0]?.children[0]?.id!;

    const updatedSettings = updateSettings(withBlock.content, {
      subject: "Hello",
      width: 640,
    });
    expect(updatedSettings.settings.subject).toBe("Hello");
    expect(updatedSettings.settings.width).toBe(640);

    const updatedBlock = updateBlockProps(updatedSettings, blockId, {
      text: "Updated copy",
    });
    const textBlock = findBlock(updatedBlock, blockId)?.block;
    expect(textBlock?.type).toBe("text");
    if (textBlock?.type === "text") {
      expect(textBlock.props.text).toBe("Updated copy");
    }
  });

  it("moves content blocks between columns", () => {
    let content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    content = addColumn(content, content.body[0]!.children[0]!.id, 1).content;

    const firstColumnId = content.body[0]!.children[0]!.children[0]!.id;
    const secondColumnId = content.body[0]!.children[0]!.children[1]!.id;

    content = addContentBlock(content, firstColumnId, "button").content;
    const blockId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;

    const moved = moveContentBlock(content, blockId, secondColumnId, 0);
    expect(moved.body[0]!.children[0]!.children[0]!.children).toHaveLength(0);
    expect(moved.body[0]!.children[0]!.children[1]!.children[0]?.type).toBe(
      "button",
    );

    expect(sectionId).toBeTruthy();
    expect(createContentBlock("heading").type).toBe("heading");
  });

  it("reorders content blocks within the same column", () => {
    let content = createEmptyTemplateContent();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;

    content = addContentBlock(content, columnId, "heading").content;
    content = addContentBlock(content, columnId, "text").content;
    content = addContentBlock(content, columnId, "button").content;
    content = addContentBlock(content, columnId, "divider").content;

    const column = () => content.body[0]!.children[0]!.children[0]!.children;
    const blockId = (index: number) => column()[index]!.id;
    const blockTypes = (value: typeof content) =>
      value.body[0]!.children[0]!.children[0]!.children.map((child) => child.type);

    const movedDown = moveContentBlock(content, blockId(0), columnId, 2);
    expect(blockTypes(movedDown)).toEqual(["text", "button", "heading", "divider"]);

    const movedUp = moveContentBlock(content, blockId(3), columnId, 1);
    expect(blockTypes(movedUp)).toEqual(["heading", "divider", "text", "button"]);

    for (let from = 0; from < column().length; from += 1) {
      for (let to = 0; to < column().length; to += 1) {
        if (from === to) {
          continue;
        }

        const moved = moveContentBlock(content, blockId(from), columnId, to);
        const originalTypes = blockTypes(content);
        const expected = [...originalTypes];
        expected.splice(to, 0, expected.splice(from, 1)[0]!);

        expect(blockTypes(moved)).toEqual(expected);
      }
    }
  });

  it("appends to an empty column when dropped on the column", () => {
    let content = createEmptyTemplateContent();
    content = addColumn(content, content.body[0]!.children[0]!.id, 1).content;

    const sourceColumnId = content.body[0]!.children[0]!.children[0]!.id;
    const emptyColumnId = content.body[0]!.children[0]!.children[1]!.id;

    content = addContentBlock(content, sourceColumnId, "heading").content;
    const blockId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;

    const moved = moveContentBlock(content, blockId, emptyColumnId, 0);
    expect(moved.body[0]!.children[0]!.children[1]!.children).toHaveLength(1);
    expect(moved.body[0]!.children[0]!.children[1]!.children[0]?.type).toBe(
      "heading",
    );
  });

  it("removes blocks", () => {
    const base = createEmptyTemplateContent();
    const columnId = base.body[0]!.children[0]!.children[0]!.id;
    const withBlock = addContentBlock(base, columnId, "divider");
    const blockId = withBlock.content.body[0]!.children[0]!.children[0]!.children[0]!.id;

    const removed = removeBlock(withBlock.content, blockId);
    expect(removed.body[0]!.children[0]!.children[0]!.children).toHaveLength(0);
  });

  it("reorders sections within the template body", () => {
    let content = createEmptyTemplateContent();
    content = addSection(content).content;
    content = addSection(content).content;

    const firstSectionId = content.body[0]!.id;
    const secondSectionId = content.body[1]!.id;
    const thirdSectionId = content.body[2]!.id;

    const moved = moveSection(content, thirdSectionId, 0);
    expect(moved.body.map((section) => section.id)).toEqual([
      thirdSectionId,
      firstSectionId,
      secondSectionId,
    ]);
  });

  it("moves rows across sections while preserving descendants", () => {
    let content = createEmptyTemplateContent();
    content = addSection(content).content;

    const sourceSectionId = content.body[0]!.id;
    const targetSectionId = content.body[1]!.id;
    const sourceRowId = content.body[0]!.children[0]!.id;

    content = addContentBlock(
      content,
      content.body[0]!.children[0]!.children[0]!.id,
      "heading",
    ).content;
    const headingId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;

    const moved = moveRow(content, sourceRowId, targetSectionId, 0);
    expect(moved.body[0]!.children).toHaveLength(0);
    expect(moved.body[1]!.children[0]!.id).toBe(sourceRowId);
    expect(moved.body[1]!.children[0]!.children[0]!.children[0]!.id).toBe(
      headingId,
    );

    expect(sourceSectionId).toBeTruthy();
  });

  it("reorders columns within the same row", () => {
    let content = createEmptyTemplateContent();
    content = addColumn(content, content.body[0]!.children[0]!.id, 1).content;

    const rowId = content.body[0]!.children[0]!.id;
    const firstColumnId = content.body[0]!.children[0]!.children[0]!.id;
    const secondColumnId = content.body[0]!.children[0]!.children[1]!.id;

    const moved = moveColumn(content, secondColumnId, rowId, 0);
    expect(moved.body[0]!.children[0]!.children.map((column) => column.id)).toEqual([
      secondColumnId,
      firstColumnId,
    ]);
  });

  it("moves columns across rows while preserving content blocks", () => {
    let content = createEmptyTemplateContent();
    content = addRow(content, content.body[0]!.id).content;

    const sourceRowId = content.body[0]!.children[0]!.id;
    const targetRowId = content.body[0]!.children[1]!.id;
    const sourceColumnId = content.body[0]!.children[0]!.children[0]!.id;

    content = addContentBlock(content, sourceColumnId, "text").content;
    const textBlockId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;

    const moved = moveColumn(content, sourceColumnId, targetRowId, 0);
    expect(moved.body[0]!.children[0]!.children).toHaveLength(0);
    expect(moved.body[0]!.children[1]!.children[0]!.id).toBe(sourceColumnId);
    expect(moved.body[0]!.children[1]!.children[0]!.children[0]!.id).toBe(
      textBlockId,
    );
  });

  it("rejects invalid layout moves without mutating the tree", () => {
    const content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    const rowId = content.body[0]!.children[0]!.id;
    const columnId = content.body[0]!.children[0]!.children[0]!.id;

    expect(moveSection(content, "missing-section", 0)).toBe(content);
    expect(moveRow(content, rowId, "missing-section", 0)).toBe(content);
    expect(moveColumn(content, columnId, "missing-row", 0)).toBe(content);
    expect(moveSection(content, sectionId, 0)).toBe(content);
    expect(isDescendantOf(content, sectionId, rowId)).toBe(true);
    expect(isDescendantOf(content, rowId, sectionId)).toBe(false);
  });
});
