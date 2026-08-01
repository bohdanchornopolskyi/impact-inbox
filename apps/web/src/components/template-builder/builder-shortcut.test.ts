/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import { matchBuilderShortcut } from "./builder-shortcut";

function keyEvent(
  init: KeyboardEventInit & { target?: EventTarget | null },
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", init);
  if (init.target) {
    Object.defineProperty(event, "target", { value: init.target });
  }
  return event;
}

describe("matchBuilderShortcut", () => {
  it("matches history and chrome shortcuts", () => {
    expect(matchBuilderShortcut(keyEvent({ key: "z", metaKey: true }))).toBe(
      "undo",
    );
    expect(
      matchBuilderShortcut(
        keyEvent({ key: "z", metaKey: true, shiftKey: true }),
      ),
    ).toBe("redo");
    expect(matchBuilderShortcut(keyEvent({ key: "y", ctrlKey: true }))).toBe(
      "redo",
    );
    expect(matchBuilderShortcut(keyEvent({ key: "s", metaKey: true }))).toBe(
      "save",
    );
    expect(matchBuilderShortcut(keyEvent({ key: "p", ctrlKey: true }))).toBe(
      "preview",
    );
    expect(matchBuilderShortcut(keyEvent({ key: "Escape" }))).toBe("deselect");
    expect(matchBuilderShortcut(keyEvent({ key: "Delete" }))).toBe("delete");
    expect(matchBuilderShortcut(keyEvent({ key: "Backspace" }))).toBe("delete");
    expect(matchBuilderShortcut(keyEvent({ key: "d", metaKey: true }))).toBe(
      "duplicate",
    );
  });

  it("keeps save and preview inside editable fields", () => {
    const input = document.createElement("input");
    expect(
      matchBuilderShortcut(keyEvent({ key: "s", metaKey: true, target: input })),
    ).toBe("save");
    expect(
      matchBuilderShortcut(keyEvent({ key: "p", metaKey: true, target: input })),
    ).toBe("preview");
    expect(
      matchBuilderShortcut(keyEvent({ key: "z", metaKey: true, target: input })),
    ).toBeNull();
    expect(
      matchBuilderShortcut(keyEvent({ key: "Backspace", target: input })),
    ).toBeNull();
    expect(
      matchBuilderShortcut(keyEvent({ key: "d", metaKey: true, target: input })),
    ).toBeNull();
  });
});
