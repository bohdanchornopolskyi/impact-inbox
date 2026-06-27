"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type SegmentedControlOption = {
  value: string;
  label?: string;
  ariaLabel?: string;
  icon?: ReactNode;
};

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  iconOnly?: boolean;
};

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  iconOnly = false,
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
        const showIconOnly = iconOnly || Boolean(option.icon && !option.label);
        const accessibleName =
          option.ariaLabel ?? option.label ?? option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={accessibleName}
            title={accessibleName}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-sm text-ui-sm font-medium transition-colors duration-180",
              showIconOnly ? "size-8" : "gap-1.5 px-3 py-1.5",
              active
                ? "bg-surface-card text-text-primary shadow-xs"
                : "bg-transparent text-text-tertiary hover:text-text-secondary",
            )}
          >
            {option.icon}
            {!showIconOnly && option.label ? option.label : null}
          </button>
        );
      })}
    </div>
  );
}
