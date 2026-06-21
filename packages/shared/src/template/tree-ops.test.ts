import { describe, expect, it } from "vitest";
import {
  addContentBlock,
  addColumn,
  ensureDefaultStructure,
  findBlock,
  moveContentBlock,
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
    const heading = withBlock.body[0]?.children[0]?.children[0]?.children[0];
    expect(heading?.type).toBe("heading");

    const found = findBlock(withBlock, heading!.id);
    expect(found?.block.type).toBe("heading");
  });

  it("updates settings and block props", () => {
    const base = createEmptyTemplateContent();
    const columnId = base.body[0]?.children[0]?.children[0]?.id!;
    const withBlock = addContentBlock(base, columnId, "text");
    const blockId = withBlock.body[0]?.children[0]?.children[0]?.children[0]?.id!;

    const updatedSettings = updateSettings(withBlock, {
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
    content = addColumn(content, content.body[0]!.children[0]!.id, 1);

    const firstColumnId = content.body[0]!.children[0]!.children[0]!.id;
    const secondColumnId = content.body[0]!.children[0]!.children[1]!.id;

    content = addContentBlock(content, firstColumnId, "button");
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

    content = addContentBlock(content, columnId, "heading");
    content = addContentBlock(content, columnId, "text");
    content = addContentBlock(content, columnId, "button");
    content = addContentBlock(content, columnId, "divider");

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
    content = addColumn(content, content.body[0]!.children[0]!.id, 1);

    const sourceColumnId = content.body[0]!.children[0]!.children[0]!.id;
    const emptyColumnId = content.body[0]!.children[0]!.children[1]!.id;

    content = addContentBlock(content, sourceColumnId, "heading");
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
    const blockId = withBlock.body[0]!.children[0]!.children[0]!.children[0]!.id;

    const removed = removeBlock(withBlock, blockId);
    expect(removed.body[0]!.children[0]!.children[0]!.children).toHaveLength(0);
  });
});
