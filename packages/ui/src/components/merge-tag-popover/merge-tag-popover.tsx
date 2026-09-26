"use client";

import { Braces } from "lucide-react";
import { Button } from "../button/button";

export type MergeTagPopoverProps = {
  label: string;
  fallback: string;
  onFallbackChange: (value: string) => void;
  onChangeField: () => void;
  onRemove: () => void;
  onDone: () => void;
};

export function MergeTagPopover({
  label,
  fallback,
  onFallbackChange,
  onChangeField,
  onRemove,
  onDone,
}: MergeTagPopoverProps) {
  const trimmed = fallback.trim();
  const hint = trimmed
    ? `Sent when a contact has no ${label.toLowerCase()}: “${trimmed}”`
    : "Fields without a fallback send blank.";

  return (
    <div className="flex w-[280px] flex-col gap-2.5 p-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-accent-soft px-[7px] text-xs font-medium text-brand-700">
          <Braces className="size-[11px]" strokeWidth={1.5} aria-hidden />
          {label}
        </span>
        <button
          type="button"
          className="text-xs font-medium text-accent"
          onClick={onChangeField}
        >
          Change field
        </button>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-text-2">Fallback</span>
        <input
          value={fallback}
          aria-label="Fallback"
          className="h-8 rounded-sm border border-border-strong bg-surface px-2.5 text-xs font-medium text-text outline-none focus-visible:border-accent"
          onChange={(event) => onFallbackChange(event.target.value)}
        />
        <span className="text-[11.5px] leading-snug text-text-2">{hint}</span>
      </label>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-xs font-medium text-danger"
          onClick={onRemove}
        >
          Remove tag
        </button>
        <Button size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
