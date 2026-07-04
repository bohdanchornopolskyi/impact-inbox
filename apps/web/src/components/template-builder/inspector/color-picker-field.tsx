"use client";

import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { BasePopover, Input, cn } from "@repo/ui/client";
import { FieldRow } from "./fields";

const PRESET_COLORS = [
  "#ffffff",
  "#f4f4f5",
  "#e4e4e7",
  "#71717a",
  "#27272a",
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#2563eb",
];

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`;
  }

  return "#000000";
}

export function ColorPickerField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(normalizeHex(value ?? "#000000"));

  useEffect(() => {
    setDraft(normalizeHex(value ?? "#000000"));
  }, [value]);

  function commit(next: string) {
    if (disabled) {
      return;
    }

    const normalized = normalizeHex(next);
    setDraft(normalized);
    onChange(normalized);
  }

  return (
    <FieldRow label={label}>
      <div className="flex items-center gap-2">
        <BasePopover.Root>
          <BasePopover.Trigger
            aria-label={`Pick ${label.toLowerCase()}`}
            disabled={disabled}
            className={cn(
              "size-9 shrink-0 rounded-md border border-border-strong shadow-xs",
              "transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border",
              disabled && "cursor-not-allowed opacity-50",
            )}
            style={{ backgroundColor: draft }}
          />
          <BasePopover.Portal>
            <BasePopover.Positioner align="start" sideOffset={8}>
              <BasePopover.Popup className="z-50 w-64 rounded-xl border border-border-default bg-surface-card p-3 shadow-pop outline-none">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-lg [&_.react-colorful]:h-36 [&_.react-colorful]:w-full [&_.react-colorful__saturation]:rounded-t-lg [&_.react-colorful__hue]:h-3 [&_.react-colorful__hue]:rounded-full">
                    <HexColorPicker color={draft} onChange={commit} />
                  </div>
                  <div className="grid grid-cols-8 gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={color}
                        onClick={() => commit(color)}
                        className={cn(
                          "size-6 rounded-md border border-border-subtle transition-transform hover:scale-110",
                          draft === color && "ring-2 ring-accent-border ring-offset-1",
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <Input
                    value={draft}
                    placeholder="#000000"
                    mono
                    disabled={disabled}
                    onChange={(event) => {
                      const next = event.target.value;
                      setDraft(next.startsWith("#") ? next : `#${next}`);
                      if (/^#?[0-9a-fA-F]{6}$/.test(next.trim())) {
                        commit(next);
                      }
                    }}
                    onBlur={() => commit(draft)}
                  />
                </div>
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        </BasePopover.Root>
        <Input
          value={draft}
          placeholder="#000000"
          mono
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            if (/^#?[0-9a-fA-F]{6}$/.test(next.trim())) {
              commit(next);
            }
          }}
          onBlur={() => commit(draft)}
        />
      </div>
    </FieldRow>
  );
}
