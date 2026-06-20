"use client";

import { cn } from "../../lib/cn";

export type SwitchProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
};

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  label,
  id,
}: SwitchProps) {
  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative h-[21px] w-9 shrink-0 rounded-full border-none p-0 transition-colors duration-180 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-accent" : "bg-border-strong",
      )}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 left-0.5 size-[17px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-[left] duration-180",
          checked && "left-[17px]",
        )}
        aria-hidden
      />
    </button>
  );

  if (!label) {
    return control;
  }

  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
      htmlFor={id}
    >
      <span className="text-ui-sm text-text-secondary">{label}</span>
      {control}
    </label>
  );
}
