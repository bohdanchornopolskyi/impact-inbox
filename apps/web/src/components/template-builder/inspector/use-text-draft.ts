"use client";

import type { KeyboardEvent } from "react";
import { useState } from "react";
import { shownDraft } from "./text-draft";

export function useTextDraft(value: string) {
  const [draft, setDraft] = useState<{ text: string; base: string } | null>(
    null,
  );

  return {
    value: shownDraft(draft, value),
    onChange(text: string) {
      setDraft({ text, base: value });
    },
    finish(next: string, apply: () => void) {
      if (next === value) {
        setDraft(null);
        return;
      }
      setDraft({ text: next, base: value });
      apply();
    },
    onEnterBlur(event: KeyboardEvent<HTMLElement>) {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      event.currentTarget.blur();
    },
  };
}
