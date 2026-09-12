import { Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { halfHourTimes } from "../../lib/picker-date";

export type TimePickerProps = {
  value?: string;
  times?: string[];
  onValueChange?: (time: string) => void;
  className?: string;
};

export function TimePicker({
  value,
  times = halfHourTimes(),
  onValueChange,
  className,
}: TimePickerProps) {
  return (
    <div
      className={cn(
        "relative h-[268px] w-[168px] overflow-hidden rounded-lg border border-border bg-surface p-1.5",
        className,
      )}
    >
      <div className="flex h-full flex-col gap-0.5 overflow-y-auto">
        {times.map((time) => {
          const selected = time === value;
          return (
            <button
              key={time}
              type="button"
              aria-selected={selected || undefined}
              className={cn(
                "flex h-[34px] w-full shrink-0 items-center justify-between rounded-sm px-2.5 text-sm transition-[background-color,color] duration-150 ease-out",
                selected
                  ? "bg-accent-soft font-semibold text-brand-700"
                  : "text-text hover:bg-surface-sunken",
              )}
              onClick={() => onValueChange?.(time)}
            >
              {time}
              {selected ? (
                <Check className="size-[13px] text-accent" strokeWidth={1.5} />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[39px] bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}
