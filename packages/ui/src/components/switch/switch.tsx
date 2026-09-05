"use client";

import { useId } from "react";
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
  const generatedId = useId();
  const switchId = id ?? generatedId;

  const control = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border-none p-0.5 transition-colors duration-150 ease-out disabled:cursor-not-allowed",
        checked ? "bg-accent disabled:bg-brand-200" : "bg-neutral-300 disabled:bg-neutral-200",
      )}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white shadow-xs transition-transform duration-150 ease-out motion-reduce:transition-none",
          checked && "translate-x-4",
        )}
        aria-hidden
      />
    </button>
  );

  if (!label) {
    return control;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <label
        htmlFor={switchId}
        className={cn(
          "text-sm text-text-2",
          disabled && "pointer-events-none text-text-3",
        )}
      >
        {label}
      </label>
      {control}
    </div>
  );
}
