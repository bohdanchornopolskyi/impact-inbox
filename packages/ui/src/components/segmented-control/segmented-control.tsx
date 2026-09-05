"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "../../lib/cn";
import { tooltipPopupClassName } from "../tooltip/tooltip";

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

function nextIndex(current: number, key: string, length: number) {
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return length - 1;
  }
  if (key === "ArrowRight" || key === "ArrowDown") {
    return (current + 1) % length;
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (current - 1 + length) % length;
  }
  return current;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  iconOnly = false,
  disabled = false,
}: SegmentedControlProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function activate(index: number) {
    const option = options[index];
    if (!option || disabled) {
      return;
    }
    onChange(option.value);
    buttonRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const mapped = nextIndex(index, event.key, options.length);
    if (mapped === index) {
      return;
    }
    event.preventDefault();
    activate(mapped);
  }

  return (
    <div
      className={cn(
        "inline-flex w-fit rounded-sm bg-surface-sunken p-0.75",
        iconOnly ? "gap-1.5" : "gap-0.5",
        className,
      )}
      role="radiogroup"
    >
      {options.map((option, index) => {
        const active = option.value === value;
        const showIconOnly = iconOnly || Boolean(option.icon && !option.label);
        const accessibleName = option.ariaLabel ?? option.label ?? option.value;
        const buttonClassName = cn(
          "inline-flex items-center justify-center rounded-sm text-sm font-semibold transition-[background-color,color,box-shadow] duration-150 ease-out disabled:cursor-not-allowed disabled:text-text-3",
          showIconOnly ? "size-8" : "gap-1.5 px-3 py-1.5",
          active
            ? "bg-surface text-text shadow-xs disabled:bg-neutral-100 disabled:shadow-none"
            : "bg-transparent text-text-3 hover:bg-neutral-200 hover:text-text-2 active:bg-neutral-200 active:text-text disabled:hover:bg-transparent",
        );

        if (!showIconOnly) {
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={accessibleName}
              disabled={disabled}
              tabIndex={active ? 0 : -1}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              onClick={() => activate(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={buttonClassName}
            >
              {option.icon}
              {option.label}
            </button>
          );
        }

        return (
          <Tooltip.Root key={option.value}>
            <Tooltip.Trigger
              delay={300}
              disabled={disabled}
              render={
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={accessibleName}
                  disabled={disabled}
                  tabIndex={active ? 0 : -1}
                  ref={(node) => {
                    buttonRefs.current[index] = node;
                  }}
                  onClick={() => activate(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={buttonClassName}
                />
              }
            >
              {option.icon}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="bottom" sideOffset={6}>
                <Tooltip.Popup className={tooltipPopupClassName}>
                  {accessibleName}
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        );
      })}
    </div>
  );
}
