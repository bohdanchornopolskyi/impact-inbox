import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type CalendarDayProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  today?: boolean;
  inRange?: boolean;
  outside?: boolean;
};

export function CalendarDay({
  selected = false,
  today = false,
  inRange = false,
  outside = false,
  disabled,
  className,
  children,
  ...props
}: CalendarDayProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={today ? "date" : undefined}
      aria-selected={selected || undefined}
      className={cn(
        "inline-flex h-[34px] w-full items-center justify-center rounded-sm text-sm transition-[background-color,border-color,color] duration-150 ease-out",
        selected
          ? "bg-accent font-semibold text-text-inverse hover:bg-accent"
          : inRange
            ? "bg-accent-soft text-brand-700 hover:bg-accent-soft"
            : today
              ? "border border-border-strong font-semibold text-text hover:bg-surface-sunken"
              : outside || disabled
                ? "text-neutral-400"
                : "text-text hover:bg-surface-sunken",
        disabled && !selected && "hover:bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
