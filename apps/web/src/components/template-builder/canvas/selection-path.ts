import {
  findBlock,
  getBlockLabel,
  getBlockTypeLabel,
  siblingPosition,
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

export function selectionPathKey(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string {
  return selectionCrumbs(content, selectedBlockId)
    .map((crumb) => `${crumb.id ?? "body"}:${crumb.type}`)
    .join("/");
}

export function selectedBlockLabel(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string | null {
  if (!selectedBlockId) {
    return null;
  }

  const found = findBlock(content, selectedBlockId);
  return found ? getBlockLabel(found.block) : null;
}

const SIBLING_PARENT_LABELS: Partial<Record<TemplateBlockType, string>> = {
  section: "Body",
  row: "Section",
  column: "Row",
};

export function selectionSiblingContext(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string | null {
  if (!selectedBlockId) {
    return null;
  }

  const found = findBlock(content, selectedBlockId);
  const position = found ? siblingPosition(content, found) : null;
  if (!found || !position) {
    return null;
  }

  const parent = SIBLING_PARENT_LABELS[found.block.type] ?? "Column";
  return `in ${parent} · ${position.index + 1} of ${position.count}`;
}
