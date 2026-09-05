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
  variant?: "default" | "device";
  size?: "md" | "sm";
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
  variant = "default",
  size = "md",
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

  const isDevice = variant === "device";
  const isSm = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex w-fit",
        isDevice
          ? "gap-0.5 rounded-md bg-bg p-0.75"
          : isSm
            ? "gap-0.5 rounded-sm bg-bg p-0.5"
            : iconOnly
              ? "gap-1.5 rounded-sm bg-surface-sunken p-0.75"
              : "gap-0.5 rounded-sm bg-surface-sunken p-0.75",
        className,
      )}
      role="radiogroup"
    >
      {options.map((option, index) => {
        const active = option.value === value;
        const showIconOnly = iconOnly || Boolean(option.icon && !option.label);
        const accessibleName = option.ariaLabel ?? option.label ?? option.value;
        const buttonClassName = cn(
          "inline-flex items-center justify-center transition-[background-color,color,box-shadow] duration-150 ease-out disabled:cursor-not-allowed disabled:text-text-3",
          isDevice
            ? "gap-1.5 rounded-sm px-3 py-1.5 text-sm [&_svg]:size-[15px]"
            : showIconOnly
              ? isSm
                ? "size-7 rounded-xs"
                : "size-8 rounded-sm"
              : isSm
                ? "h-7 rounded-xs px-2 text-xs"
                : "gap-1.5 rounded-sm px-3 py-1.5 text-sm",
          active
            ? "bg-surface font-semibold text-text shadow-xs disabled:bg-neutral-100 disabled:shadow-none"
            : cn(
                "bg-transparent font-medium disabled:hover:bg-transparent",
                isDevice
                  ? "text-text-3 hover:text-text-2"
                  : isSm
                    ? "text-text-2 hover:bg-neutral-200 active:bg-neutral-200 active:text-text"
                    : "font-semibold text-text-3 hover:bg-neutral-200 hover:text-text-2 active:bg-neutral-200 active:text-text",
              ),
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
