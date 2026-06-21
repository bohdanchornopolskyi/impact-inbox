"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type SegmentedControlOption = {
  value: string;
  label: string;
  icon?: ReactNode;
};

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex gap-0.5 rounded-lg bg-surface-inset p-[3px]",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-ui-sm font-medium transition-colors duration-180",
              option.icon && !option.label ? "px-2 py-1.5" : "",
              active
                ? "bg-surface-card text-text-primary shadow-xs"
                : "bg-transparent text-text-tertiary hover:text-text-secondary",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
