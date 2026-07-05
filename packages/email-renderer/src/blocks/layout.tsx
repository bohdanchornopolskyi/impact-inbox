import { Column, Row, Section } from "@react-email/components";
import {
  CANVAS_BLOCK_ID_ATTR,
  CANVAS_BLOCK_LABEL_ATTR,
  CANVAS_BLOCK_TYPE_ATTR,
  CANVAS_EMPTY_COLUMN_ATTR,
  CANVAS_EMPTY_PLACEHOLDER_ATTR,
  CANVAS_EMPTY_ROW_ATTR,
  CANVAS_EMPTY_SECTION_ATTR,
  CANVAS_LAYOUT_ROLE_ATTR,
  getBlockTypeLabel,
  resolveRowColumnWidths,
  type ColumnBlock,
  type RowBlock,
  type SectionBlock,
} from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { renderContentBlockHtml, type RenderContext } from "./content-block-registry";

function layoutBlockMarkers(
  block: SectionBlock | RowBlock | ColumnBlock,
): Record<string, string> {
  return {
    [CANVAS_BLOCK_ID_ATTR]: block.id,
    [CANVAS_BLOCK_TYPE_ATTR]: block.type,
    [CANVAS_BLOCK_LABEL_ATTR]: getBlockTypeLabel(block.type),
    [CANVAS_LAYOUT_ROLE_ATTR]: block.type,
  };
}

export function rowReverseOnMobile(
  row: RowBlock,
  sectionProps: SectionBlock["props"],
): boolean {
  return row.props.reverseOnMobile ?? sectionProps.reverseColumnsOnMobile ?? false;
}

function renderColumnBlock(
  column: ColumnBlock,
  context: RenderContext,
  gapPadding: number,
) {
  const width = column.props.width ? `${column.props.width}%` : undefined;

  return (
    <Column
      key={column.id}
      className="stack-column"
      {...layoutBlockMarkers(column)}
      {...(column.children.length === 0
        ? { [CANVAS_EMPTY_COLUMN_ATTR]: "" }
        : {})}
      style={{
        ...blockStylesToCss(column.styles),
        width,
        verticalAlign: column.styles?.verticalAlign ?? "top",
        paddingRight: gapPadding > 0 ? gapPadding : undefined,
      }}
    >
      {column.children.length === 0 ? (
        <div key={`${column.id}-empty`} {...{ [CANVAS_EMPTY_PLACEHOLDER_ATTR]: "" }} />
      ) : null}
      {column.children.map((child) => renderContentBlockHtml(child, context))}
    </Column>
  );
}

function renderRowBlock(
  row: RowBlock,
  context: RenderContext,
  sectionProps: SectionBlock["props"],
) {
  const reverseOnMobile = rowReverseOnMobile(row, sectionProps);
  const gap = row.props.gap ?? 0;
  const columnWidths = resolveRowColumnWidths(row);

  return (
    <Row
      key={row.id}
      className={reverseOnMobile ? `row-${row.id}` : undefined}
      {...layoutBlockMarkers(row)}
      {...(row.children.length === 0 ? { [CANVAS_EMPTY_ROW_ATTR]: "" } : {})}
      style={blockStylesToCss(row.styles)}
    >
      {row.children.length === 0 ? (
        <div key={`${row.id}-empty`} {...{ [CANVAS_EMPTY_PLACEHOLDER_ATTR]: "" }} />
      ) : null}
      {row.children.map((column, index) => {
        const widthPercent = columnWidths[index];
        const columnWithWidth =
          widthPercent !== undefined
            ? {
                ...column,
                props: { ...column.props, width: widthPercent },
              }
            : column;
        const isLast = index === row.children.length - 1;

        return renderColumnBlock(columnWithWidth, context, isLast ? 0 : gap);
      })}
    </Row>
  );
}

export function renderSectionBlock(
  section: SectionBlock,
  context: RenderContext,
) {
  const {
    fullWidth,
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
  } = section.props;

  return (
    <Section
      key={section.id}
      {...layoutBlockMarkers(section)}
      {...(section.children.length === 0 ? { [CANVAS_EMPTY_SECTION_ATTR]: "" } : {})}
      style={{
        ...blockStylesToCss(section.styles),
        width: fullWidth ? "100%" : undefined,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? (backgroundSize ?? "cover") : undefined,
        backgroundPosition: backgroundImage
          ? (backgroundPosition ?? "center center")
          : undefined,
        backgroundRepeat: backgroundImage
          ? (backgroundRepeat ?? "no-repeat")
          : undefined,
      }}
    >
      {section.children.length === 0 ? (
        <div key={`${section.id}-empty`} {...{ [CANVAS_EMPTY_PLACEHOLDER_ATTR]: "" }} />
      ) : null}
      {section.children.map((row) =>
        renderRowBlock(row, context, section.props),
      )}
    </Section>
  );
}
