/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it } from "vitest";
import { buildCanvasBridgeDocument } from "./canvas-bridge";

type ParentMessage = {
  type: string;
  [key: string]: unknown;
};

function extractBridgeScript(documentHtml: string): string {
  const match = documentHtml.match(
    /<script id="canvas-bridge-script">([\s\S]*?)<\/script>/,
  );
  if (!match?.[1]) {
    throw new Error("bridge script missing from document");
  }
  return match[1];
}

function installDocumentCommandStubs(doc: Document) {
  const documentWithCommands = doc as Document & {
    queryCommandState?: (command: string) => boolean;
    execCommand?: (command: string, showUI?: boolean, value?: string) => boolean;
  };
  documentWithCommands.queryCommandState = () => false;
  documentWithCommands.execCommand = () => true;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function createEditHarness(bodyHtml: string) {
  const messages: ParentMessage[] = [];
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);

  const contentWindow = iframe.contentWindow;
  const contentDocument = iframe.contentDocument;
  if (!contentWindow || !contentDocument) {
    throw new Error("iframe document unavailable");
  }
  const iframeWindow = contentWindow;
  const iframeDocument = contentDocument;

  const parentProxy = {
    postMessage(data: unknown) {
      messages.push(data as ParentMessage);
    },
  };

  Object.defineProperty(iframeWindow, "parent", {
    configurable: true,
    writable: true,
    value: parentProxy,
  });

  iframeDocument.open();
  iframeDocument.write(`<!doctype html><html><body>${bodyHtml}</body></html>`);
  iframeDocument.close();
  installDocumentCommandStubs(iframeDocument);

  const bridged = buildCanvasBridgeDocument(
    `<html><body>${bodyHtml}</body></html>`,
    { canEdit: true },
  );
  (iframeWindow as Window & { eval(code: string): unknown }).eval(
    extractBridgeScript(bridged),
  );

  function postFromParent(data: object) {
    iframeWindow.dispatchEvent(
      new MessageEvent("message", {
        data,
        source: parentProxy as MessageEventSource,
      }),
    );
  }

  function messagesOfType(type: string) {
    return messages.filter((message) => message.type === type);
  }

  function requireBlock(blockId: string) {
    const block = iframeDocument.querySelector(`[data-block-id="${blockId}"]`);
    if (!block) {
      throw new Error(`block ${blockId} not found`);
    }
    return block;
  }

  return {
    iframe,
    iframeWindow,
    iframeDocument,
    messages,
    messagesOfType,
    postFromParent,
    clickBlock(blockId: string) {
      requireBlock(blockId).dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        }),
      );
    },
    dblclickEditable(blockId: string) {
      const block = requireBlock(blockId);
      const editable =
        (block.querySelector("[data-editable]") as HTMLElement | null) ??
        (block.querySelector("h1,h2,h3,h4,h5,h6,p,span") as HTMLElement | null) ??
        (block as HTMLElement);
      editable.dispatchEvent(
        new MouseEvent("dblclick", {
          bubbles: true,
          cancelable: true,
        }),
      );
    },
  };
}

const openHarnesses: Array<{ iframe: HTMLIFrameElement }> = [];

afterEach(() => {
  for (const harness of openHarnesses.splice(0)) {
    harness.iframe.remove();
  }
  document.body.innerHTML = "";
});

describe("canvas bridge edit lifecycle", () => {
  it("posts block-select on click", async () => {
    const harness = await createEditHarness(
      `<div data-block-id="heading-1" data-block-type="heading"><h1 data-editable data-editable-prop="text">Hello</h1></div>`,
    );
    openHarnesses.push(harness);

    harness.clickBlock("heading-1");

    expect(harness.messagesOfType("block-select")).toEqual([
      { type: "block-select", blockId: "heading-1" },
    ]);
  });

  it("posts plain edit-start then commit on blur", async () => {
    const harness = await createEditHarness(
      `<div data-block-id="heading-1" data-block-type="heading"><h1 data-editable data-editable-prop="text">Hello</h1></div>`,
    );
    openHarnesses.push(harness);

    harness.postFromParent({
      type: "select-block",
      blockId: "heading-1",
      label: "Heading",
    });
    harness.dblclickEditable("heading-1");
    await wait(0);

    expect(harness.messagesOfType("block-edit-start")).toEqual([
      { type: "block-edit-start", blockId: "heading-1", editKind: "plain" },
    ]);

    const editable = harness.iframeDocument.querySelector(
      "[data-block-id='heading-1'] [data-editable]",
    ) as HTMLElement;
    expect(editable.isContentEditable).toBe(true);
    editable.replaceChildren(harness.iframeDocument.createTextNode("Updated"));
    editable.dispatchEvent(
      new FocusEvent("blur", { bubbles: true }),
    );

    expect(harness.messagesOfType("block-edit-commit")).toEqual([
      {
        type: "block-edit-commit",
        blockId: "heading-1",
        prop: "text",
        value: "Updated",
      },
    ]);
  });

  it("cancels plain edit via Escape without commit", async () => {
    const harness = await createEditHarness(
      `<div data-block-id="text-1" data-block-type="text"><p data-editable data-editable-prop="text">Body</p></div>`,
    );
    openHarnesses.push(harness);

    harness.postFromParent({ type: "select-block", blockId: "text-1" });
    harness.dblclickEditable("text-1");
    await wait(0);

    const editable = harness.iframeDocument.querySelector(
      "[data-block-id='text-1'] [data-editable]",
    ) as HTMLElement;
    expect(harness.messagesOfType("block-edit-start")).toHaveLength(1);
    editable.replaceChildren(harness.iframeDocument.createTextNode("Changed"));
    editable.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(harness.messagesOfType("block-edit-cancel")).toEqual([
      { type: "block-edit-cancel", blockId: "text-1" },
    ]);
    expect(harness.messagesOfType("block-edit-commit")).toEqual([]);
  });

  it("posts richtext edit-start, sync, and commit from parent command", async () => {
    const harness = await createEditHarness(
      `<div data-block-id="richtext-1" data-block-type="richtext" data-block-label="Rich text"><div data-editable data-editable-kind="richtext" data-editable-prop="html"><p>Hi</p></div></div>`,
    );
    openHarnesses.push(harness);

    harness.postFromParent({
      type: "select-block",
      blockId: "richtext-1",
      label: "Rich text",
    });
    harness.dblclickEditable("richtext-1");

    expect(harness.messagesOfType("block-edit-start")).toEqual([
      {
        type: "block-edit-start",
        blockId: "richtext-1",
        editKind: "richtext",
      },
    ]);

    const editable = harness.iframeDocument.querySelector(
      "[data-editable-kind='richtext']",
    ) as HTMLElement;
    editable.innerHTML = "<p>Hello world</p>";
    editable.dispatchEvent(
      new Event("input", { bubbles: true }),
    );
    await wait(250);

    expect(harness.messagesOfType("block-edit-sync").at(-1)).toMatchObject({
      type: "block-edit-sync",
      blockId: "richtext-1",
      prop: "html",
      value: "<p>Hello world</p>",
    });

    harness.postFromParent({ type: "richtext-commit" });

    expect(harness.messagesOfType("block-edit-commit").at(-1)).toMatchObject({
      type: "block-edit-commit",
      blockId: "richtext-1",
      prop: "html",
      value: "<p>Hello world</p>",
    });
  });

  it("cancels richtext edit from parent command", async () => {
    const harness = await createEditHarness(
      `<div data-block-id="richtext-1" data-block-type="richtext"><div data-editable data-editable-kind="richtext" data-editable-prop="html"><p>Original</p></div></div>`,
    );
    openHarnesses.push(harness);

    harness.postFromParent({ type: "select-block", blockId: "richtext-1" });
    harness.dblclickEditable("richtext-1");
    expect(harness.messagesOfType("block-edit-start")).toHaveLength(1);

    const editable = harness.iframeDocument.querySelector(
      "[data-editable-kind='richtext']",
    ) as HTMLElement;
    editable.innerHTML = "<p>Dirty</p>";

    harness.postFromParent({ type: "richtext-cancel" });

    expect(harness.messagesOfType("block-edit-cancel")).toEqual([
      { type: "block-edit-cancel", blockId: "richtext-1" },
    ]);
    expect(editable.innerHTML).toContain("Original");
    expect(harness.messagesOfType("block-edit-commit")).toEqual([]);
  });

  it("posts history-undo and history-redo when not editing", async () => {
    const harness = await createEditHarness(
      `<div data-block-id="heading-1" data-block-type="heading"><h1 data-editable data-editable-prop="text">Hello</h1></div>`,
    );
    openHarnesses.push(harness);

    harness.iframeWindow.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "z",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    harness.iframeWindow.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "z",
        metaKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(harness.messagesOfType("builder-shortcut")).toEqual([
      { type: "builder-shortcut", action: "undo" },
      { type: "builder-shortcut", action: "redo" },
    ]);
  });

  it("posts save even while inline editing", async () => {
    const harness = await createEditHarness(
      `<div data-block-id="heading-1" data-block-type="heading"><h1 data-editable data-editable-prop="text">Hello</h1></div>`,
    );
    openHarnesses.push(harness);

    harness.postFromParent({
      type: "select-block",
      blockId: "heading-1",
      label: "Heading",
    });
    harness.dblclickEditable("heading-1");
    await wait(0);

    harness.iframeWindow.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "s",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(harness.messagesOfType("builder-shortcut")).toEqual([
      { type: "builder-shortcut", action: "save" },
    ]);
  });

  it("keeps native undo during inline edit", async () => {
    const harness = await createEditHarness(
      `<div data-block-id="heading-1" data-block-type="heading"><h1 data-editable data-editable-prop="text">Hello</h1></div>`,
    );
    openHarnesses.push(harness);

    harness.postFromParent({
      type: "select-block",
      blockId: "heading-1",
      label: "Heading",
    });
    harness.dblclickEditable("heading-1");
    await wait(0);

    expect(harness.messagesOfType("block-edit-start")).toEqual([
      { type: "block-edit-start", blockId: "heading-1", editKind: "plain" },
    ]);

    harness.iframeWindow.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "z",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(harness.messagesOfType("builder-shortcut")).toEqual([]);
  });
});
