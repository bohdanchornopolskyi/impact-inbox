/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import {
  builderShortcutLabel,
  getBuilderShortcutRuntimeScript,
  matchBuilderShortcut,
} from "./builder-shortcut";

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
    expect(
      matchBuilderShortcut(
        keyEvent({ key: "l", metaKey: true, shiftKey: true }),
      ),
    ).toBe("save-library");
    expect(matchBuilderShortcut(keyEvent({ key: "r", metaKey: true }))).toBe(
      null,
    );
    expect(
      matchBuilderShortcut(
        keyEvent({ key: "ç", code: "KeyC", metaKey: true, altKey: true }),
      ),
    ).toBe("copy-style");
    expect(
      matchBuilderShortcut(
        keyEvent({ key: "√", code: "KeyV", metaKey: true, altKey: true }),
      ),
    ).toBe("paste-style");
    expect(
      matchBuilderShortcut(keyEvent({ key: "ArrowUp", metaKey: true })),
    ).toBe("move-up");
    expect(
      matchBuilderShortcut(keyEvent({ key: "ArrowDown", ctrlKey: true })),
    ).toBe("move-down");
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
    expect(
      matchBuilderShortcut(
        keyEvent({ key: "l", metaKey: true, shiftKey: true, target: input }),
      ),
    ).toBeNull();
  });

  it("ignores combos with extra modifiers", () => {
    expect(
      matchBuilderShortcut(keyEvent({ key: "s", metaKey: true, altKey: true })),
    ).toBeNull();
    expect(
      matchBuilderShortcut(keyEvent({ key: "d", metaKey: true, shiftKey: true })),
    ).toBeNull();
  });

  it("matches the same actions in the canvas runtime", () => {
    const runtimeMatch = new Function(
      `${getBuilderShortcutRuntimeScript()}; return matchBuilderShortcut;`,
    )() as (event: KeyboardEvent, inField: boolean) => string | null;
    const cases: KeyboardEventInit[] = [
      { key: "z", metaKey: true },
      { key: "z", metaKey: true, shiftKey: true },
      { key: "s", ctrlKey: true },
      { key: "l", metaKey: true, shiftKey: true },
      { key: "r", metaKey: true },
      { key: "ç", code: "KeyC", metaKey: true, altKey: true },
      { key: "ArrowDown", metaKey: true },
      { key: "Backspace" },
      { key: "s", metaKey: true, altKey: true },
    ];

    for (const init of cases) {
      const event = keyEvent(init);
      expect(runtimeMatch(event, false)).toBe(matchBuilderShortcut(event));
    }
    expect(runtimeMatch(keyEvent({ key: "Backspace" }), true)).toBeNull();
    expect(runtimeMatch(keyEvent({ key: "s", metaKey: true }), true)).toBe(
      "save",
    );
  });
});

describe("builderShortcutLabel", () => {
  it("renders the combo from the shortcut table", () => {
    expect(builderShortcutLabel("save-library")).toBe("⌘⇧L");
    expect(builderShortcutLabel("duplicate")).toBe("⌘D");
    expect(builderShortcutLabel("copy-style")).toBe("⌘⌥C");
    expect(builderShortcutLabel("move-up")).toBe("⌘↑");
    expect(builderShortcutLabel("delete")).toBe("Del");
  });
});
