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
  "aria-label"?: string;
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
  "aria-label": ariaLabel,
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
        "inline-flex h-control-md w-fit items-center gap-0.5 rounded-md bg-bg p-0.75",
        className,
      )}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        const showIconOnly = iconOnly || Boolean(option.icon && !option.label);
        const accessibleName = option.ariaLabel ?? option.label ?? option.value;
        const buttonClassName = cn(
          "inline-flex h-control-sm items-center justify-center gap-1.5 rounded-sm px-3 text-sm transition-[background-color,color,box-shadow] duration-150 ease-out disabled:cursor-not-allowed disabled:text-text-3 [&_svg]:size-[15px]",
          showIconOnly && "min-w-control-sm px-0",
          active
            ? "bg-surface font-semibold text-text shadow-xs disabled:bg-neutral-100 disabled:shadow-none"
            : "bg-transparent font-medium text-text-3 hover:text-text-2 disabled:hover:text-text-3",
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
