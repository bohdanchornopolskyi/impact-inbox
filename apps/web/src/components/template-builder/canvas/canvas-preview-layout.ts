import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
  TemplateContentData,
} from "@repo/shared";

type LayoutColumnSnapshot = {
  id: string;
  type: "column";
  props: ColumnBlock["props"];
  styles: ColumnBlock["styles"];
  children: string[];
};

type LayoutRowSnapshot = {
  id: string;
  type: "row";
  props: RowBlock["props"];
  styles: RowBlock["styles"];
  children: LayoutColumnSnapshot[];
};

type LayoutSectionSnapshot = {
  id: string;
  type: "section";
  props: SectionBlock["props"];
  styles: SectionBlock["styles"];
  children: LayoutRowSnapshot[];
};

function snapshotLayout(body: SectionBlock[]): LayoutSectionSnapshot[] {
  return body.map((section) => ({
    id: section.id,
    type: section.type,
    props: section.props,
    styles: section.styles,
    children: section.children.map((row) => ({
      id: row.id,
      type: row.type,
      props: row.props,
      styles: row.styles,
      children: row.children.map((column) => ({
        id: column.id,
        type: column.type,
        props: column.props,
        styles: column.styles,
        children: column.children.map((block) => block.id),
      })),
    })),
  }));
}

export function getPreviewLayoutKey(content: TemplateContentData): string {
  return JSON.stringify({
    settings: content.settings,
    layout: snapshotLayout(content.body),
  });
}

export function needsPreviewFullReload(options: {
  hasSrcDoc: boolean;
  layoutKey: string;
  appliedLayoutKey: string;
  canEdit: boolean;
  appliedCanEdit: boolean;
}): boolean {
  return (
    !options.hasSrcDoc ||
    options.layoutKey !== options.appliedLayoutKey ||
    options.canEdit !== options.appliedCanEdit
  );
}
