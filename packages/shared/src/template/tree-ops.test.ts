import { describe, expect, it } from "vitest";
import {
  addContentBlock,
  addColumn,
  addRow,
  addSection,
  duplicateBlock,
  ensureDefaultStructure,
  findBlock,
  isDescendantOf,
  moveColumn,
  moveContentBlock,
  moveRow,
  moveSection,
  removeBlock,
  resolveStructurePanelContentTarget,
  type TreeMutationResult,
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
    expect(withBlock.changed).toBe(true);
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
    expect(sectionResult.changed).toBe(true);
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
    expect(moved.changed).toBe(true);
    expect(moved.content.body[0]!.children[0]!.children[0]!.children).toHaveLength(0);
    expect(moved.content.body[0]!.children[0]!.children[1]!.children[0]?.type).toBe(
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
    const blockTypes = (value: TreeMutationResult["content"]) =>
      value.body[0]!.children[0]!.children[0]!.children.map((child) => child.type);

    const movedDown = moveContentBlock(content, blockId(0), columnId, 2);
    expect(movedDown.changed).toBe(true);
    expect(blockTypes(movedDown.content)).toEqual(["text", "button", "heading", "divider"]);

    const movedUp = moveContentBlock(content, blockId(3), columnId, 1);
    expect(movedUp.changed).toBe(true);
    expect(blockTypes(movedUp.content)).toEqual(["heading", "divider", "text", "button"]);

    for (let from = 0; from < column().length; from += 1) {
      for (let to = 0; to < column().length; to += 1) {
        if (from === to) {
          continue;
        }

        const moved = moveContentBlock(content, blockId(from), columnId, to);
        const originalTypes = blockTypes(content);
        const expected = [...originalTypes];
        expected.splice(to, 0, expected.splice(from, 1)[0]!);

        expect(moved.changed).toBe(true);
        expect(blockTypes(moved.content)).toEqual(expected);
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
    expect(moved.changed).toBe(true);
    expect(moved.content.body[0]!.children[0]!.children[1]!.children).toHaveLength(1);
    expect(moved.content.body[0]!.children[0]!.children[1]!.children[0]?.type).toBe(
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
    expect(moved.changed).toBe(true);
    expect(moved.content.body.map((section) => section.id)).toEqual([
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
    expect(moved.changed).toBe(true);
    expect(moved.content.body[0]!.children).toHaveLength(0);
    expect(moved.content.body[1]!.children[0]!.id).toBe(sourceRowId);
    expect(moved.content.body[1]!.children[0]!.children[0]!.children[0]!.id).toBe(
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
    expect(moved.changed).toBe(true);
    expect(moved.content.body[0]!.children[0]!.children.map((column) => column.id)).toEqual([
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
    expect(moved.changed).toBe(true);
    expect(moved.content.body[0]!.children[0]!.children).toHaveLength(0);
    expect(moved.content.body[0]!.children[1]!.children[0]!.id).toBe(sourceColumnId);
    expect(moved.content.body[0]!.children[1]!.children[0]!.children[0]!.id).toBe(
      textBlockId,
    );
  });

  it("rejects invalid layout moves without mutating the tree", () => {
    const content = createEmptyTemplateContent();
    const sectionId = content.body[0]!.id;
    const rowId = content.body[0]!.children[0]!.id;
    const columnId = content.body[0]!.children[0]!.children[0]!.id;

    expect(moveSection(content, "missing-section", 0)).toEqual({
      content,
      changed: false,
      reason: "block_not_found",
    });
    expect(moveRow(content, rowId, "missing-section", 0)).toEqual({
      content,
      changed: false,
      reason: "parent_not_found",
    });
    expect(moveColumn(content, columnId, "missing-row", 0)).toEqual({
      content,
      changed: false,
      reason: "parent_not_found",
    });
    expect(moveSection(content, sectionId, 0)).toEqual({
      content,
      changed: false,
      reason: "noop",
    });
    expect(isDescendantOf(content, sectionId, rowId)).toBe(true);
    expect(isDescendantOf(content, rowId, sectionId)).toBe(false);
  });

  it("does not drop content blocks when the target column is missing", () => {
    const content = createEmptyTemplateContent();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;
    const withBlock = addContentBlock(content, columnId, "heading");
    const blockId = withBlock.content.body[0]!.children[0]!.children[0]!.children[0]!.id;

    const outcome = moveContentBlock(
      withBlock.content,
      blockId!,
      "missing-column",
      0,
    );

    expect(outcome.changed).toBe(false);
    expect(outcome.reason).toBe("parent_not_found");
    expect(findBlock(outcome.content, blockId!)).toBeDefined();
  });

  it("does not return a selectable block id when insert parent is missing", () => {
    const content = createEmptyTemplateContent();
    const outcome = addContentBlock(content, "missing-column", "heading");

    expect(outcome.changed).toBe(false);
    expect(outcome.reason).toBe("parent_not_found");
    expect(outcome.blockId).toBeUndefined();
    expect(findBlock(outcome.content, outcome.blockId ?? "")).toBeUndefined();
  });

  it("reports no-op content moves without changing the tree", () => {
    const content = createEmptyTemplateContent();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;
    const withBlock = addContentBlock(content, columnId, "heading");
    const blockId = withBlock.content.body[0]!.children[0]!.children[0]!.children[0]!.id;

    const outcome = moveContentBlock(withBlock.content, blockId!, columnId, 0);

    expect(outcome.changed).toBe(false);
    expect(outcome.reason).toBe("noop");
    expect(outcome.content).toBe(withBlock.content);
  });

  it("resolves structure panel same-column downward targets consistently", () => {
    let content = createEmptyTemplateContent();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;

    content = addContentBlock(content, columnId, "heading").content;
    content = addContentBlock(content, columnId, "text").content;
    content = addContentBlock(content, columnId, "button").content;
    content = addContentBlock(content, columnId, "divider").content;

    const blockId = (index: number) =>
      content.body[0]!.children[0]!.children[0]!.children[index]!.id;

    const target = resolveStructurePanelContentTarget(content, blockId(0), {
      kind: "content",
      blockId: blockId(2),
    });
    expect(target).toEqual({ columnId, index: 2 });

    const moved = moveContentBlock(content, blockId(0), columnId, target!.index);
    expect(moved.changed).toBe(true);
    expect(
      moved.content.body[0]!.children[0]!.children[0]!.children.map((child) => child.type),
    ).toEqual(["text", "button", "heading", "divider"]);
  });

  it("resolves structure panel append targets within the same column", () => {
    let content = createEmptyTemplateContent();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;

    content = addContentBlock(content, columnId, "heading").content;
    content = addContentBlock(content, columnId, "text").content;

    const activeId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;
    const target = resolveStructurePanelContentTarget(content, activeId, {
      kind: "append",
      columnId,
    });

    expect(target).toEqual({ columnId, index: 1 });

    const moved = moveContentBlock(content, activeId, columnId, target!.index);
    expect(
      moved.content.body[0]!.children[0]!.children[0]!.children.map((child) => child.type),
    ).toEqual(["text", "heading"]);
  });

  it("duplicates a content block directly after the original", () => {
    let content = createEmptyTemplateContent();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;

    content = addContentBlock(content, columnId, "heading").content;
    content = addContentBlock(content, columnId, "text").content;

    const heading = content.body[0]!.children[0]!.children[0]!.children[0]!;
    const result = duplicateBlock(content, heading.id);
    expect(result.changed).toBe(true);

    const children = result.content.body[0]!.children[0]!.children[0]!.children;
    expect(children.map((child) => child.type)).toEqual([
      "heading",
      "heading",
      "text",
    ]);

    const clone = children[1]!;
    expect(result.blockId).toBe(clone.id);
    expect(clone.id).not.toBe(heading.id);
    expect(clone.props).toEqual(heading.props);
  });

  it("duplicates a section with fresh ids on every descendant", () => {
    let content = createEmptyTemplateContent();
    const columnId = content.body[0]!.children[0]!.children[0]!.id;
    content = addContentBlock(content, columnId, "heading").content;

    const section = content.body[0]!;
    const result = duplicateBlock(content, section.id);
    expect(result.changed).toBe(true);
    expect(result.content.body).toHaveLength(2);

    const clone = result.content.body[1]!;
    expect(result.blockId).toBe(clone.id);

    const ids = [
      clone.id,
      ...clone.children.flatMap((row) => [
        row.id,
        ...row.children.flatMap((column) => [
          column.id,
          ...column.children.map((child) => child.id),
        ]),
      ]),
    ];
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(section.id);
    expect(ids).not.toContain(columnId);
    expect(clone.children[0]!.children[0]!.children[0]!.type).toBe("heading");
  });

  it("duplicates a column and redistributes row widths", () => {
    const content = createEmptyTemplateContent();
    const row = content.body[0]!.children[0]!;
    const column = row.children[0]!;

    const result = duplicateBlock(content, column.id);
    expect(result.changed).toBe(true);

    const duplicatedRow = result.content.body[0]!.children[0]!;
    expect(duplicatedRow.children).toHaveLength(2);
    expect(duplicatedRow.props.columnWidths).toEqual([50, 50]);
    expect(duplicatedRow.children[1]!.id).not.toBe(column.id);
  });

  it("reports block_not_found when duplicating an unknown block", () => {
    const content = createEmptyTemplateContent();
    const result = duplicateBlock(content, "missing-id");

    expect(result.changed).toBe(false);
    expect(result.reason).toBe("block_not_found");
    expect(result.content).toBe(content);
  });
});
