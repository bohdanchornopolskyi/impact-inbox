import { describe, expect, it } from "vitest";
import { mergeRichtextHeadingStyle } from "./richtext-heading-styles";

describe("mergeRichtextHeadingStyle", () => {
  it("applies defaults when style is missing", () => {
    expect(mergeRichtextHeadingStyle("h1", undefined)).toBe(
      "font-size:32px;font-weight:700;margin:0",
    );
  });

  it("keeps custom font-size and fills other heading defaults", () => {
    expect(mergeRichtextHeadingStyle("h1", "font-size:40px")).toBe(
      "font-size:40px;font-weight:700;margin:0",
    );
  });

  it("merges margin with defaults when font-size is absent", () => {
    expect(mergeRichtextHeadingStyle("h2", "margin:0")).toBe(
      "margin:0;font-size:24px;font-weight:700",
    );
  });
});
