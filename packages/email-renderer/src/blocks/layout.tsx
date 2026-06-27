import { Column, Row, Section } from "@react-email/components";
import type { ColumnBlock, RowBlock, SectionBlock } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { renderContentBlockHtml, type RenderContext } from "./content-block-registry";

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
      style={{
        ...blockStylesToCss(column.styles),
        width,
        verticalAlign: column.styles?.verticalAlign ?? "top",
        paddingRight: gapPadding > 0 ? gapPadding : undefined,
      }}
    >
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

  return (
    <Row
      key={row.id}
      className={reverseOnMobile ? `row-${row.id}` : undefined}
      style={blockStylesToCss(row.styles)}
    >
      {row.children.map((column, index) => {
        const explicitWidth = row.props.columnWidths?.[index];
        const columnWithWidth =
          explicitWidth !== undefined
            ? {
                ...column,
                props: { ...column.props, width: explicitWidth },
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
      {section.children.map((row) =>
        renderRowBlock(row, context, section.props),
      )}
    </Section>
  );
}
