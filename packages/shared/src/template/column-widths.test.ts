import { describe, expect, it } from "vitest";
import type { RowBlock } from "../schemas/template/blocks/layout";
import {
  distributeEqualColumnWidths,
  resolveRowColumnWidths,
  rowWithRedistributedColumnWidths,
  shownColumnWidthMode,
  widthForColumnMode,
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

describe("shownColumnWidthMode", () => {
  it("stays fixed when Fill is switched to Fixed, including the default 50", () => {
    const width = widthForColumnMode("fixed", undefined);

    expect(width).toBe(50);
    expect(shownColumnWidthMode(width, { mode: "fixed", width })).toBe("fixed");
  });

  it("stays fixed when the custom width is cleared or set to 50", () => {
    expect(shownColumnWidthMode(undefined, { mode: "fixed", width: undefined })).toBe(
      "fixed",
    );
    expect(shownColumnWidthMode(50, { mode: "fixed", width: 50 })).toBe("fixed");
  });

  it("uses the stored width when this column has no choice, or the width changed outside", () => {
    expect(shownColumnWidthMode(undefined, undefined)).toBe("fill");
    expect(shownColumnWidthMode(50, undefined)).toBe("fixed");
    expect(shownColumnWidthMode(undefined, { mode: "fixed", width: 40 })).toBe("fill");
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
