import {
  getBlockTypeLabel,
  type TemplateBlockType,
  type TemplateContentData,
} from "@repo/shared";

export type LayersTreeNode = {
  id: string;
  label: string;
  type: TemplateBlockType;
  children?: LayersTreeNode[];
  columnId?: string;
};

export function buildLayersTree(content: TemplateContentData): LayersTreeNode[] {
  return content.body.map((section) => ({
    id: section.id,
    label: getBlockTypeLabel("section"),
    type: section.type,
    children: section.children.map((row) => ({
      id: row.id,
      label: getBlockTypeLabel("row"),
      type: row.type,
      children: row.children.map((column) => ({
        id: column.id,
        label: getBlockTypeLabel("column"),
        type: column.type,
        columnId: column.id,
        children: column.children.map((child) => ({
          id: child.id,
          label: getBlockTypeLabel(child.type),
          type: child.type,
          columnId: column.id,
        })),
      })),
    })),
  }));
}

export function getLayersTreeKey(content: TemplateContentData): string {
  return JSON.stringify(
    content.body.map((section) => [
      section.id,
      section.type,
      section.children.map((row) => [
        row.id,
        row.type,
        row.children.map((column) => [
          column.id,
          column.type,
          column.children.map((child) => [child.id, child.type]),
        ]),
      ]),
    ]),
  );
}
