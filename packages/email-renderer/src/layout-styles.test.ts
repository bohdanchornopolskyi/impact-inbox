import { describe, expect, it } from "vitest";
import type { TemplateContentData } from "@repo/shared";
import { buildLayoutMobileStyles } from "./layout-styles";

const baseContent: TemplateContentData = {
  version: 1,
  settings: { width: 600 },
  body: [
    {
      id: "section-1",
      type: "section",
      props: { reverseColumnsOnMobile: true },
      children: [
        {
          id: "row-1",
          type: "row",
          props: {},
          children: [
            {
              id: "col-1",
              type: "column",
              props: {},
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

describe("buildLayoutMobileStyles", () => {
  it("includes stack-column mobile styles", () => {
    const css = buildLayoutMobileStyles(baseContent);

    expect(css).toContain(".stack-column");
    expect(css).toContain("max-width: 480px");
  });

  it("includes reverse styles when section requests mobile reversal", () => {
    const css = buildLayoutMobileStyles(baseContent);

    expect(css).toContain(".row-row-1");
    expect(css).toContain("column-reverse");
  });

  it("prefers row-level reverseOnMobile over section default", () => {
    const content: TemplateContentData = {
      ...baseContent,
      body: [
        {
          ...baseContent.body[0]!,
          props: { reverseColumnsOnMobile: false },
          children: [
            {
              id: "row-2",
              type: "row",
              props: { reverseOnMobile: true },
              children: [
                {
                  id: "col-2",
                  type: "column",
                  props: {},
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const css = buildLayoutMobileStyles(content);

    expect(css).toContain(".row-row-2");
    expect(css).toContain("column-reverse");
  });
});
