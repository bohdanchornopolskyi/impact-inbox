import { describe, expect, it } from "vitest";
import type { RowBlock } from "../schemas/template/blocks/layout";
import {
  distributeEqualColumnWidths,
  resolveRowColumnWidths,
  rowWithRedistributedColumnWidths,
} from "./column-widths";

function rowWithColumns(count: number, columnWidths?: number[]): RowBlock {
  return {
    id: "row-1",
    type: "row",
    props: columnWidths ? { columnWidths } : {},
    children: Array.from({ length: count }, (_, index) => ({
      id: `col-${index + 1}`,
      type: "column" as const,
      props: {},
      children: [],
    })),
  };
}

describe("distributeEqualColumnWidths", () => {
  it("returns empty array for a single column", () => {
    expect(distributeEqualColumnWidths(1)).toEqual([]);
  });

  it("splits two columns evenly", () => {
    expect(distributeEqualColumnWidths(2)).toEqual([50, 50]);
  });

  it("splits three columns to sum to 100", () => {
    expect(distributeEqualColumnWidths(3)).toEqual([34, 33, 33]);
  });
});

describe("resolveRowColumnWidths", () => {
  it("redistributes when column count outgrew stored widths", () => {
    const row = rowWithColumns(3, [50, 50]);
    expect(resolveRowColumnWidths(row)).toEqual([34, 33, 33]);
  });

  it("keeps valid explicit widths", () => {
    const row = rowWithColumns(2, [60, 40]);
    expect(resolveRowColumnWidths(row)).toEqual([60, 40]);
  });
});

describe("rowWithRedistributedColumnWidths", () => {
  it("writes equal widths after adding a column", () => {
    const row = rowWithRedistributedColumnWidths(rowWithColumns(3));
    expect(row.props.columnWidths).toEqual([34, 33, 33]);
  });

  it("clears widths for a single-column row", () => {
    const row = rowWithRedistributedColumnWidths(rowWithColumns(1, [100]));
    expect(row.props.columnWidths).toBeUndefined();
  });
});
