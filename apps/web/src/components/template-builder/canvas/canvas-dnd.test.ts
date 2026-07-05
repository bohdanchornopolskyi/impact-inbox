import { describe, expect, it } from "vitest";
import type { TemplateContentData } from "@repo/shared";
import {
  canDropContentBlockAtTarget,
  isCanvasDragCommitMessage,
  isCanvasDragHandleDownMessage,
} from "./canvas-dnd";

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
              children: [
                {
                  id: "heading-1",
                  type: "heading",
                  props: { text: "Hello", level: 1 },
                },
              ],
            },
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

describe("isCanvasDragHandleDownMessage", () => {
  it("accepts drag-handle pointer down messages", () => {
    expect(
      isCanvasDragHandleDownMessage({
        type: "canvas-drag-handle-down",
        blockId: "heading-1",
        clientX: 10,
        clientY: 20,
      }),
    ).toBe(true);
  });
});

describe("isCanvasDragCommitMessage", () => {
  it("accepts commit messages with column targets", () => {
    expect(
      isCanvasDragCommitMessage({
        type: "canvas-drag-commit",
        blockId: "heading-1",
        target: { kind: "column", columnId: "col-2", index: 0 },
      }),
    ).toBe(true);
    expect(
      isCanvasDragCommitMessage({
        type: "canvas-drag-commit",
        blockId: "heading-1",
        target: null,
      }),
    ).toBe(true);
  });
});

describe("canDropContentBlockAtTarget", () => {
  it("accepts column targets for content blocks", () => {
    expect(
      canDropContentBlockAtTarget(content, "heading-1", {
        kind: "column",
        columnId: "col-2",
        index: 0,
      }),
    ).toBe(true);
  });

  it("rejects non-column targets and layout blocks", () => {
    expect(
      canDropContentBlockAtTarget(content, "heading-1", {
        kind: "body",
        index: 0,
      }),
    ).toBe(false);
    expect(
      canDropContentBlockAtTarget(content, "section-1", {
        kind: "column",
        columnId: "col-1",
        index: 0,
      }),
    ).toBe(false);
  });
});
