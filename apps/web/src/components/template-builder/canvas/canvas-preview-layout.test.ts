import { describe, expect, it } from "vitest";
import type { TemplateContentData } from "@repo/shared";
import {
  getPreviewLayoutKey,
  needsPreviewFullReload,
} from "@repo/shared";

const baseContent: TemplateContentData = {
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

describe("getPreviewLayoutKey", () => {
  it("stays stable when only a content block prop changes", () => {
    const updated: TemplateContentData = {
      ...baseContent,
      body: [
        {
          ...baseContent.body[0]!,
          children: [
            {
              ...baseContent.body[0]!.children[0]!,
              children: [
                {
                  ...baseContent.body[0]!.children[0]!.children[0]!,
                  children: [
                    {
                      id: "heading-1",
                      type: "heading",
                      props: { text: "Updated", level: 1 },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(getPreviewLayoutKey(baseContent)).toBe(getPreviewLayoutKey(updated));
  });

  it("changes when template settings change", () => {
    const updated: TemplateContentData = {
      ...baseContent,
      settings: { width: 640 },
    };

    expect(getPreviewLayoutKey(baseContent)).not.toBe(
      getPreviewLayoutKey(updated),
    );
  });

  it("changes when layout props change", () => {
    const updated: TemplateContentData = {
      ...baseContent,
      body: [
        {
          ...baseContent.body[0]!,
          props: { backgroundImage: "https://example.com/bg.png" },
        },
      ],
    };

    expect(getPreviewLayoutKey(baseContent)).not.toBe(
      getPreviewLayoutKey(updated),
    );
  });

  it("changes when content blocks are reordered", () => {
    const updated: TemplateContentData = {
      ...baseContent,
      body: [
        {
          ...baseContent.body[0]!,
          children: [
            {
              ...baseContent.body[0]!.children[0]!,
              children: [
                {
                  ...baseContent.body[0]!.children[0]!.children[0]!,
                  children: [
                    {
                      id: "text-1",
                      type: "text",
                      props: { text: "Second" },
                    },
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

    expect(getPreviewLayoutKey(baseContent)).not.toBe(
      getPreviewLayoutKey(updated),
    );
  });
});

describe("needsPreviewFullReload", () => {
  it("reloads when layout or edit mode changes", () => {
    expect(
      needsPreviewFullReload({
        hasSrcDoc: true,
        layoutKey: "a",
        appliedLayoutKey: "a",
        canEdit: true,
        appliedCanEdit: true,
      }),
    ).toBe(false);

    expect(
      needsPreviewFullReload({
        hasSrcDoc: true,
        layoutKey: "b",
        appliedLayoutKey: "a",
        canEdit: true,
        appliedCanEdit: true,
      }),
    ).toBe(true);

    expect(
      needsPreviewFullReload({
        hasSrcDoc: false,
        layoutKey: "a",
        appliedLayoutKey: "a",
        canEdit: true,
        appliedCanEdit: true,
      }),
    ).toBe(true);
  });
});
