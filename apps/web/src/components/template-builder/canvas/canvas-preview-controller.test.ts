import { describe, expect, it, vi } from "vitest";
import type { TemplateContentData } from "@repo/shared";
import {
  createCanvasPreviewController,
  resolveEffectiveHtml,
  resolvePreviewUpdate,
  sanitizeEditValue,
} from "./canvas-preview-controller";

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
                  id: "richtext-1",
                  type: "richtext",
                  props: { html: "<p>Hi</p>" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe("resolvePreviewUpdate", () => {
  it("returns none while preview is paused during edit", () => {
    expect(
      resolvePreviewUpdate({
        effectiveHtml: "<html></html>",
        layoutKey: "a",
        debouncedHash: "hash-1",
        canEdit: true,
        previewPaused: true,
        previewMatchesContent: true,
        hasSrcDoc: true,
        appliedLayoutKey: "a",
        appliedCanEdit: true,
        appliedHtmlHash: "hash-0",
        iframeReady: true,
      }),
    ).toBe("none");
  });

  it("patches when only content props change", () => {
    expect(
      resolvePreviewUpdate({
        effectiveHtml: "<html>updated</html>",
        layoutKey: "a",
        debouncedHash: "hash-2",
        canEdit: true,
        previewPaused: false,
        previewMatchesContent: true,
        hasSrcDoc: true,
        appliedLayoutKey: "a",
        appliedCanEdit: true,
        appliedHtmlHash: "hash-1",
        iframeReady: true,
      }),
    ).toBe("patch");
  });

  it("reloads when layout changes", () => {
    expect(
      resolvePreviewUpdate({
        effectiveHtml: "<html></html>",
        layoutKey: "b",
        debouncedHash: "hash-1",
        canEdit: true,
        previewPaused: false,
        previewMatchesContent: true,
        hasSrcDoc: true,
        appliedLayoutKey: "a",
        appliedCanEdit: true,
        appliedHtmlHash: "hash-1",
        iframeReady: true,
      }),
    ).toBe("reload");
  });
});

describe("resolveEffectiveHtml", () => {
  it("freezes html while preview is paused", () => {
    expect(resolveEffectiveHtml(true, "<html>live</html>", "<html>paused</html>")).toBe(
      "<html>paused</html>",
    );
  });
});

describe("sanitizeEditValue", () => {
  it("sanitizes richtext html on commit", () => {
    expect(
      sanitizeEditValue("html", '<p>Hi<script>alert(1)</script></p>'),
    ).not.toContain("<script>");
  });
});

function createController(
  overrides: Partial<Parameters<typeof createCanvasPreviewController>[0]> = {},
) {
  return createCanvasPreviewController({
    getContent: () => baseContent,
    getHtml: () => "<html></html>",
    getDebouncedHash: () => "hash",
    getPreviewMatchesContent: () => true,
    getSelectedBlockId: () => "richtext-1",
    getSelectedLabel: () => "Rich Text",
    getCanEdit: () => true,
    selectBlock: vi.fn(),
    updateBlockProps: vi.fn(),
    beginInlineEditSession: vi.fn(),
    commitInlineEditSession: vi.fn(),
    revertInlineEditSession: vi.fn(),
    onPlainTextEditPausedChange: vi.fn(),
    startRichtextEdit: vi.fn(),
    endRichtextEdit: vi.fn(),
    setFormatState: vi.fn(),
    onReload: vi.fn(),
    onPatch: vi.fn(),
    onSelectBlockPosted: vi.fn(),
    onDropTargetChange: vi.fn(),
    ...overrides,
  });
}

describe("createCanvasPreviewController", () => {
  it("forwards idle canvas drop-target messages", () => {
    const onDropTargetChange = vi.fn();
    const controller = createController({ onDropTargetChange });

    controller.handleMessage(
      {
        type: "canvas-drop-target",
        target: { kind: "body", index: 1 },
      },
      null,
    );

    expect(onDropTargetChange).toHaveBeenCalledWith({ kind: "body", index: 1 });
  });

  it("validates drag drop targets before notifying parent", () => {
    const onDropTargetChange = vi.fn();
    const controller = createController({ onDropTargetChange });

    controller.handleMessage(
      {
        type: "canvas-drop-target",
        target: { kind: "column", columnId: "col-1", index: 0 },
        dragKind: "section",
        dragBlockId: "section-1",
      },
      null,
    );

    expect(onDropTargetChange).toHaveBeenCalledWith(null);
  });

  it("forwards validated drag drop targets to parent", () => {
    const onDropTargetChange = vi.fn();
    const controller = createController({ onDropTargetChange });

    controller.handleMessage(
      {
        type: "canvas-drop-target",
        target: { kind: "column", columnId: "col-2", index: 0 },
        dragKind: "content",
        dragBlockId: "richtext-1",
      },
      null,
    );

    expect(onDropTargetChange).toHaveBeenCalledWith({
      kind: "column",
      columnId: "col-2",
      index: 0,
    });
  });

  it("skips history on sync and reverts the inline session on cancel", () => {
    const updates: Array<Record<string, unknown>> = [];
    const revertInlineEditSession = vi.fn();
    const controller = createController({
      updateBlockProps: (_blockId, props) => {
        updates.push(props);
      },
      revertInlineEditSession,
    });

    controller.handleMessage(
      {
        type: "block-edit-sync",
        blockId: "richtext-1",
        prop: "html",
        value: "<h1>Updated</h1>",
      },
      null,
    );
    controller.handleMessage(
      { type: "block-edit-cancel", blockId: "richtext-1" },
      null,
    );

    expect(updates).toEqual([
      {
        html: '<h1 style="font-size:32px;font-weight:700;margin:0">Updated</h1>',
      },
    ]);
    expect(revertInlineEditSession).toHaveBeenCalledTimes(1);
  });

  it("begins and reverts an inline session on cancel without leaving pause state", () => {
    const updates: Array<Record<string, unknown>> = [];
    let paused = false;
    let ended = false;
    const beginInlineEditSession = vi.fn();
    const revertInlineEditSession = vi.fn();

    const controller = createController({
      updateBlockProps: (_blockId, props) => {
        updates.push(props);
      },
      beginInlineEditSession,
      revertInlineEditSession,
      onPlainTextEditPausedChange: (value) => {
        paused = value;
      },
      endRichtextEdit: () => {
        ended = true;
      },
    });

    controller.handleMessage(
      { type: "block-edit-start", blockId: "richtext-1", editKind: "richtext" },
      null,
    );
    controller.handleMessage(
      { type: "block-edit-cancel", blockId: "richtext-1" },
      null,
    );

    expect(beginInlineEditSession).toHaveBeenCalledTimes(1);
    expect(revertInlineEditSession).toHaveBeenCalledTimes(1);
    expect(updates).toEqual([]);
    expect(paused).toBe(false);
    expect(ended).toBe(true);
    expect(controller.pausedHtmlRef.current).toBeNull();
  });
});
