export const BUILDER_SHORTCUT_ACTIONS = [
  "undo",
  "redo",
  "save",
  "preview",
  "delete",
  "duplicate",
  "deselect",
  "move-up",
  "move-down",
  "copy-style",
  "paste-style",
  "save-library",
] as const;

export type BuilderShortcutAction = (typeof BUILDER_SHORTCUT_ACTIONS)[number];

type BuilderShortcut = {
  action: BuilderShortcutAction;
  /** Lowercase `event.key`; for alt combos, the letter of `event.code`. */
  key: string;
  mod?: boolean;
  alt?: boolean;
  shift?: boolean;
  /** Fires while focus is in a text field or inline editor. */
  inFields?: boolean;
};

/** Modifier flags match exactly, so each entry is one combo. */
export const BUILDER_SHORTCUTS: readonly BuilderShortcut[] = [
  { action: "save", key: "s", mod: true, inFields: true },
  { action: "preview", key: "p", mod: true, inFields: true },
  { action: "save-library", key: "r", mod: true },
  { action: "undo", key: "z", mod: true },
  { action: "redo", key: "z", mod: true, shift: true },
  { action: "redo", key: "y", mod: true },
  { action: "duplicate", key: "d", mod: true },
  { action: "copy-style", key: "c", mod: true, alt: true },
  { action: "paste-style", key: "v", mod: true, alt: true },
  { action: "move-up", key: "arrowup", mod: true },
  { action: "move-down", key: "arrowdown", mod: true },
  { action: "deselect", key: "escape" },
  { action: "delete", key: "delete" },
  { action: "delete", key: "backspace" },
];

const KEY_LABELS: Partial<Record<string, string>> = {
  arrowup: "↑",
  arrowdown: "↓",
  delete: "Del",
};

export function builderShortcutLabel(
  action: BuilderShortcutAction,
): string | undefined {
  const shortcut = BUILDER_SHORTCUTS.find((entry) => entry.action === action);
  if (!shortcut) {
    return undefined;
  }
  return [
    shortcut.mod ? "⌘" : "",
    shortcut.alt ? "⌥" : "",
    shortcut.shift ? "⇧" : "",
    KEY_LABELS[shortcut.key] ?? shortcut.key.toUpperCase(),
  ].join("");
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function matchBuilderShortcut(
  event: KeyboardEvent,
): BuilderShortcutAction | null {
  const inField = isEditableShortcutTarget(event.target);
  const mod = event.metaKey || event.ctrlKey;
  // macOS Option rewrites event.key (⌥C is "ç"), so alt combos read the physical key.
  const key =
    event.altKey && event.code.startsWith("Key")
      ? event.code.slice(3).toLowerCase()
      : event.key.toLowerCase();

  const match = BUILDER_SHORTCUTS.find(
    (shortcut) =>
      shortcut.key === key &&
      Boolean(shortcut.mod) === mod &&
      Boolean(shortcut.alt) === event.altKey &&
      Boolean(shortcut.shift) === event.shiftKey &&
      (!inField || shortcut.inFields),
  );
  return match?.action ?? null;
}

/** ES5 twin of `matchBuilderShortcut` for the canvas iframe, driven by the same table. */
export function getBuilderShortcutRuntimeScript(): string {
  return `
  var builderShortcuts = ${JSON.stringify(BUILDER_SHORTCUTS)};

  function matchBuilderShortcut(event, inField) {
    var mod = event.metaKey || event.ctrlKey;
    var key =
      event.altKey && event.code.indexOf("Key") === 0
        ? event.code.slice(3).toLowerCase()
        : event.key.toLowerCase();
    for (var i = 0; i < builderShortcuts.length; i += 1) {
      var shortcut = builderShortcuts[i];
      if (
        shortcut.key === key &&
        Boolean(shortcut.mod) === mod &&
        Boolean(shortcut.alt) === event.altKey &&
        Boolean(shortcut.shift) === event.shiftKey &&
        (!inField || shortcut.inFields)
      ) {
        return shortcut.action;
      }
    }
    return null;
  }
`;
}
