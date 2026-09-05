import { describe, expect, it } from "vitest";
import type { TemplateContentData } from "@repo/shared";
import {
  selectionCrumbs,
  selectionSiblingContext,
} from "./selection-path";

const content: TemplateContentData = {
  version: 1,
  settings: { width: 600 },
  body: [
    {
      id: "section-1",
      type: "section",
      props: {},
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
            {
              id: "col-2",
              type: "column",
              props: {},
              children: [
                {
                  id: "heading-1",
                  type: "heading",
                  props: { text: "Hello", level: 1 },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe("selectionCrumbs", () => {
  it("starts at Body when nothing is selected", () => {
    expect(selectionCrumbs(content, null)).toEqual([
      { id: null, label: "Body", type: "body" },
    ]);
  });

  it("walks Body › Section › Row › Column", () => {
    expect(selectionCrumbs(content, "col-2").map((crumb) => crumb.label)).toEqual(
      ["Body", "Section", "Row", "Column"],
    );
  });

  it("appends the content block after Column", () => {
    const crumbs = selectionCrumbs(content, "heading-1");
    expect(crumbs.at(-1)).toEqual({
      id: "heading-1",
      label: "Heading",
      type: "heading",
    });
  });
});

describe("selectionSiblingContext", () => {
  it("describes a column among its row siblings", () => {
    expect(selectionSiblingContext(content, "col-2")).toBe("in Row · 2 of 2");
  });

  it("describes a content block among its column siblings", () => {
    expect(selectionSiblingContext(content, "heading-1")).toBe(
      "in Column · 1 of 1",
    );
  });
});
