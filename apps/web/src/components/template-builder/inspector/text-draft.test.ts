import { describe, expect, it } from "vitest";
import {
  commitBackgroundPosition,
  formatColumnWidths,
  formatTableHeaders,
  formatTableRows,
  parseColumnWidths,
  parseTableHeaders,
  parseTableRows,
  shownDraft,
} from "./text-draft";

describe("shownDraft", () => {
  it("keeps a trailing comma or space while the stored value is unchanged", () => {
    expect(shownDraft({ text: "50, ", base: "50" }, "50")).toBe("50, ");
    expect(shownDraft({ text: "center ", base: "center" }, "center")).toBe(
      "center ",
    );
    expect(shownDraft({ text: "New ", base: "New" }, "New")).toBe("New ");
  });

  it("follows an external value such as undo or a new selection", () => {
    expect(shownDraft({ text: "50, ", base: "50" }, "30, 70")).toBe("30, 70");
    expect(shownDraft({ text: "center ", base: "center" }, "left top")).toBe(
      "left top",
    );
  });
});

describe("column widths", () => {
  it("parses 50, 50 on commit and drops a trailing comma", () => {
    expect(parseColumnWidths("50, 50")).toEqual([50, 50]);
    expect(formatColumnWidths(parseColumnWidths("50, 50"))).toBe("50, 50");
    expect(parseColumnWidths("50, ")).toEqual([50]);
    expect(parseColumnWidths("")).toBeUndefined();
  });
});

describe("background position", () => {
  it("keeps internal spaces and trims only the ends", () => {
    expect(commitBackgroundPosition("center top")).toBe("center top");
    expect(commitBackgroundPosition(" center top ")).toBe("center top");
    expect(commitBackgroundPosition("   ")).toBeUndefined();
  });
});

describe("table cells", () => {
  it("parses a multi-word cell and comma-separated headers", () => {
    expect(parseTableRows("New York, Boston\nAustin, Texas")).toEqual([
      ["New York", "Boston"],
      ["Austin", "Texas"],
    ]);
    expect(formatTableRows([["New York", "Boston"]])).toBe("New York, Boston");
    expect(parseTableHeaders("City, State")).toEqual([
      { header: "City" },
      { header: "State" },
    ]);
    expect(formatTableHeaders(parseTableHeaders("City, "))).toBe("City");
  });
});
