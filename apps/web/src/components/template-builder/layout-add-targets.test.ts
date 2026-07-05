import { describe, expect, it } from "vitest";
import {
  addColumn,
  addContentBlock,
  addRow,
  addSection,
  ensureDefaultStructure,
} from "@repo/shared";
import {
  addLayoutBlock,
  isLayoutBlockType,
  resolveLayoutAddTargets,
} from "./layout-add-targets";

describe("layout-add-targets", () => {
  it("resolves column parent for a selected content block", () => {
    let content = ensureDefaultStructure({
      version: 1,
      settings: { width: 600 },
      body: [],
    });
    content = addSection(content).content;
    content = addRow(content, content.body[0]!.id).content;
    content = addColumn(content, content.body[0]!.children[0]!.id).content;
    const columnId = content.body[0]!.children[0]!.children[0]!.id;
    content = addContentBlock(content, columnId, "text").content;

    const textBlockId = content.body[0]!.children[0]!.children[0]!.children[0]!.id;
    const targets = resolveLayoutAddTargets(content, textBlockId);

    expect(targets.sectionId).toBe(content.body[0]!.id);
    expect(targets.rowId).toBe(content.body[0]!.children[0]!.id);
  });

  it("resolves section parent when a section is selected", () => {
    let content = ensureDefaultStructure({
      version: 1,
      settings: { width: 600 },
      body: [],
    });
    content = addSection(content).content;
    content = addSection(content).content;
    const sectionId = content.body[1]!.id;

    const targets = resolveLayoutAddTargets(content, sectionId);

    expect(targets.sectionId).toBe(sectionId);
  });

  it("uses default targets when nothing is selected", () => {
    let content = ensureDefaultStructure({
      version: 1,
      settings: { width: 600 },
      body: [],
    });
    content = addSection(content).content;
    content = addRow(content, content.body[0]!.id).content;

    const targets = resolveLayoutAddTargets(content, null);
    const lastSection = content.body.at(-1)!;

    expect(targets.sectionId).toBe(lastSection.id);
    expect(targets.rowId).toBe(
      lastSection.children.at(-1)?.id ?? lastSection.children[0]!.id,
    );
  });

  it("adds layout blocks through shared actions", () => {
    let content = ensureDefaultStructure({
      version: 1,
      settings: { width: 600 },
      body: [],
    });
    const sectionId = content.body[0]!.id;

    const actions = {
      addSection: () => {
        content = addSection(content).content;
      },
      addRow: (targetSectionId: string) => {
        content = addRow(content, targetSectionId).content;
      },
      addColumn: (rowId: string) => {
        content = addColumn(content, rowId).content;
      },
    };

    expect(addLayoutBlock("section", content, null, actions)).toBe(true);
    expect(content.body).toHaveLength(2);

    expect(addLayoutBlock("row", content, sectionId, actions)).toBe(true);
    expect(content.body[0]!.children).toHaveLength(2);

    const rowId = content.body[0]!.children[0]!.id;
    expect(addLayoutBlock("column", content, rowId, actions)).toBe(true);
    expect(content.body[0]!.children[0]!.children).toHaveLength(2);
  });

  it("identifies layout block types via LAYOUT_BLOCK_TYPES", () => {
    expect(isLayoutBlockType("section")).toBe(true);
    expect(isLayoutBlockType("text")).toBe(false);
  });
});
