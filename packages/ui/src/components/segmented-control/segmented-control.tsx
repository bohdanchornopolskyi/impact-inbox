"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@base-ui/react/tooltip";
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
  disabled?: boolean;
};

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  iconOnly = false,
  disabled = false,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex w-fit rounded-lg bg-surface-inset p-[3px]",
        iconOnly ? "gap-1.5" : "gap-0.5",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        const showIconOnly = iconOnly || Boolean(option.icon && !option.label);
        const accessibleName =
          option.ariaLabel ?? option.label ?? option.value;

        const buttonClassName = cn(
          "inline-flex items-center justify-center rounded-sm text-ui-sm font-medium transition-colors duration-180",
          showIconOnly ? "size-8" : "gap-1.5 px-3 py-1.5",
          active
            ? "bg-surface-card text-text-primary shadow-xs"
            : "bg-transparent text-text-tertiary hover:text-text-secondary",
        );

        function handleClick() {
          if (!disabled) {
            onChange(option.value);
          }
        }

        if (showIconOnly) {
          return (
            <Tooltip.Root key={option.value}>
              <Tooltip.Trigger
                delay={300}
                disabled={disabled}
                render={
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={accessibleName}
                    disabled={disabled}
                    className={buttonClassName}
                    onClick={handleClick}
                  />
                }
              >
                {option.icon}
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="bottom" sideOffset={6}>
                  <Tooltip.Popup className="rounded-md bg-neutral-900 px-2 py-1 text-ui-xs text-neutral-0 shadow-sm">
                    {accessibleName}
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={accessibleName}
            title={accessibleName}
            disabled={disabled}
            onClick={handleClick}
            className={buttonClassName}
          >
            {option.icon}
            {option.label ? option.label : null}
          </button>
        );
      })}
    </div>
  );
}
