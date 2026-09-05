import {
  findBlock,
  getBlockTypeLabel,
  type TemplateBlockType,
  type TemplateContentData,
} from "@repo/shared";

export type SelectionCrumb = {
  id: string | null;
  label: string;
  type: "body" | TemplateBlockType;
};

export function selectionCrumbs(
  content: TemplateContentData,
  selectedBlockId: string | null,
): SelectionCrumb[] {
  const crumbs: SelectionCrumb[] = [
    { id: null, label: "Body", type: "body" },
  ];

  if (!selectedBlockId) {
    return crumbs;
  }

  const found = findBlock(content, selectedBlockId);
  if (!found) {
    return crumbs;
  }

  const { path } = found;
  const section = content.body[path.sectionIndex];
  if (!section) {
    return crumbs;
  }

  crumbs.push({
    id: section.id,
    label: getBlockTypeLabel("section"),
    type: "section",
  });

  if (path.rowIndex === undefined) {
    return crumbs;
  }

  const row = section.children[path.rowIndex];
  if (!row) {
    return crumbs;
  }

  crumbs.push({
    id: row.id,
    label: getBlockTypeLabel("row"),
    type: "row",
  });

  if (path.columnIndex === undefined) {
    return crumbs;
  }

  const column = row.children[path.columnIndex];
  if (!column) {
    return crumbs;
  }

  crumbs.push({
    id: column.id,
    label: getBlockTypeLabel("column"),
    type: "column",
  });

  if (path.contentIndex === undefined) {
    return crumbs;
  }

  const block = column.children[path.contentIndex];
  if (!block) {
    return crumbs;
  }

  crumbs.push({
    id: block.id,
    label: getBlockTypeLabel(block.type),
    type: block.type,
  });

  return crumbs;
}

export function selectionSiblingContext(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string | null {
  if (!selectedBlockId) {
    return null;
  }

  const found = findBlock(content, selectedBlockId);
  if (!found) {
    return null;
  }

  const { path } = found;
  const section = content.body[path.sectionIndex];
  if (!section) {
    return null;
  }

  if (path.rowIndex === undefined) {
    return `in Body · ${path.sectionIndex + 1} of ${content.body.length}`;
  }

  const row = section.children[path.rowIndex];
  if (!row) {
    return null;
  }

  if (path.columnIndex === undefined) {
    return `in Section · ${path.rowIndex + 1} of ${section.children.length}`;
  }

  const column = row.children[path.columnIndex];
  if (!column) {
    return null;
  }

  if (path.contentIndex === undefined) {
    return `in Row · ${path.columnIndex + 1} of ${row.children.length}`;
  }

  return `in Column · ${path.contentIndex + 1} of ${column.children.length}`;
}
