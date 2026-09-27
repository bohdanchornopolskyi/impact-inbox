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

export type ColumnWidthMode = "fill" | "fixed";

const DEFAULT_FIXED_COLUMN_WIDTH = 50;

export function shownColumnWidthMode(
  width: number | undefined,
  chosen: { mode: ColumnWidthMode; width: number | undefined } | undefined,
): ColumnWidthMode {
  if (chosen && Object.is(chosen.width, width)) {
    return chosen.mode;
  }

  return width === undefined ? "fill" : "fixed";
}

export function widthForColumnMode(
  mode: ColumnWidthMode,
  width: number | undefined,
): number | undefined {
  if (mode === "fill") {
    return undefined;
  }

  return width ?? DEFAULT_FIXED_COLUMN_WIDTH;
}

export type RowSplit = "1:1" | "1:2" | "2:1";

export function rowSplitWidths(split: RowSplit): [number, number] {
  if (split === "1:2") {
    return [33, 67];
  }
  if (split === "2:1") {
    return [67, 33];
  }
  return [50, 50];
}

export function rowSplitFromWidths(widths: number[] | undefined): RowSplit {
  const left = widths?.[0];
  const right = widths?.[1];
  if (
    !widths ||
    widths.length !== 2 ||
    left === undefined ||
    right === undefined
  ) {
    return "1:1";
  }
  if (left < right) {
    return "1:2";
  }
  if (left > right) {
    return "2:1";
  }
  return "1:1";
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
