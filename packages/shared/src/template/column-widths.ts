import type { RowBlock } from "../schemas/template/blocks/layout";

export function distributeEqualColumnWidths(columnCount: number): number[] {
  if (columnCount <= 1) {
    return [];
  }

  const base = Math.floor(100 / columnCount);
  const remainder = 100 - base * columnCount;

  return Array.from({ length: columnCount }, (_, index) =>
    base + (index < remainder ? 1 : 0),
  );
}

function isValidColumnWidthArray(widths: number[], columnCount: number): boolean {
  if (widths.length !== columnCount) {
    return false;
  }

  if (!widths.every((width) => width >= 1 && width <= 100)) {
    return false;
  }

  const sum = widths.reduce((total, width) => total + width, 0);
  return sum >= 99 && sum <= 101;
}

export function resolveRowColumnWidths(row: RowBlock): number[] {
  const columnCount = row.children.length;
  if (columnCount <= 1) {
    return [];
  }

  const rowWidths = row.props.columnWidths;
  if (rowWidths && isValidColumnWidthArray(rowWidths, columnCount)) {
    return rowWidths;
  }

  return distributeEqualColumnWidths(columnCount);
}

export function rowWithRedistributedColumnWidths(row: RowBlock): RowBlock {
  const columnCount = row.children.length;
  if (columnCount <= 1) {
    const { columnWidths: _columnWidths, ...restProps } = row.props;
    return { ...row, props: restProps };
  }

  return {
    ...row,
    props: {
      ...row.props,
      columnWidths: distributeEqualColumnWidths(columnCount),
    },
  };
}
