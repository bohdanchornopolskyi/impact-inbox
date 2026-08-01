export type BuilderShortcutAction =
  | "undo"
  | "redo"
  | "save"
  | "preview"
  | "delete"
  | "duplicate"
  | "deselect";

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
  const modifier = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();

  if (modifier && key === "s" && !event.shiftKey) {
    return "save";
  }

  if (modifier && key === "p" && !event.shiftKey) {
    return "preview";
  }

  if (isEditableShortcutTarget(event.target)) {
    return null;
  }

  if (modifier && key === "d" && !event.shiftKey) {
    return "duplicate";
  }

  if (modifier && key === "z" && event.shiftKey) {
    return "redo";
  }
  if (modifier && key === "z") {
    return "undo";
  }
  if (modifier && key === "y") {
    return "redo";
  }

  if (key === "escape") {
    return "deselect";
  }

  if (key === "delete" || key === "backspace") {
    return "delete";
  }

  return null;
}
