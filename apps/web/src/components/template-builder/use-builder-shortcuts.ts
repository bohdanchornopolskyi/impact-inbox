"use client";

import { useEffect, useRef } from "react";
import { matchBuilderShortcut } from "./builder-shortcut";
import { useBuilderStore, useSaveRevision } from "./builder-provider";
import {
  createBuilderShortcutHandlers,
  runBuilderShortcut,
} from "./run-builder-shortcut";

export function useBuilderShortcuts() {
  const store = useBuilderStore();
  const { saveRevision } = useSaveRevision();
  const saveRevisionRef = useRef(saveRevision);
  saveRevisionRef.current = saveRevision;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const action = matchBuilderShortcut(event);
      if (!action) {
        return;
      }
      event.preventDefault();
      runBuilderShortcut(
        action,
        createBuilderShortcutHandlers(store.getState(), () => {
          void saveRevisionRef.current();
        }),
      );
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [store]);
}
