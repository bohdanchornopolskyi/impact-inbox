import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  WEEKDAY_LABELS,
  formatPickerDate,
  formatPickerMonth,
  monthCells,
  shiftYearMonth,
  toISODate,
} from "../../lib/picker-date";
import { CalendarDay } from "./calendar-day";

export type DatePickerProps = {
  month: string;
  value?: string;
  today?: string;
  minDate?: string;
  rangeStart?: string;
  rangeEnd?: string;
  onMonthChange?: (month: string) => void;
  onValueChange?: (iso: string) => void;
  className?: string;
};

function inRange(iso: string, start?: string, end?: string) {
  if (!start || !end) return false;
  return iso > start && iso < end;
}

export function DatePicker({
  month,
  value,
  today: todayProp,
  minDate,
  rangeStart,
  rangeEnd,
  onMonthChange,
  onValueChange,
  className,
}: DatePickerProps) {
  const now = new Date();
  const today = todayProp ?? toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const cells = monthCells(month);

  return (
    <div
      className={cn(
        "flex w-[300px] flex-col gap-2 rounded-lg border border-border bg-surface p-3",
        className,
      )}
    >
      <div className="flex h-[30px] items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          className="inline-flex size-7 items-center justify-center rounded-xs text-text-2 transition-[background-color] duration-150 ease-out hover:bg-surface-sunken"
          onClick={() => onMonthChange?.(shiftYearMonth(month, -1))}
        >
          <ChevronLeft className="size-icon-sm" strokeWidth={1.5} />
        </button>
        <p className="text-sm font-semibold text-text">{formatPickerMonth(month)}</p>
        <button
          type="button"
          aria-label="Next month"
          className="inline-flex size-7 items-center justify-center rounded-xs text-text-2 transition-[background-color] duration-150 ease-out hover:bg-surface-sunken"
          onClick={() => onMonthChange?.(shiftYearMonth(month, 1))}
        >
          <ChevronRight className="size-icon-sm" strokeWidth={1.5} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="inline-flex h-6 items-center justify-center text-2xs font-medium text-text-3"
          >
            {label}
          </span>
        ))}
        {cells.map((cell) => {
          const isDisabled = Boolean(minDate && cell.iso < minDate);
          return (
            <CalendarDay
              key={cell.iso}
              selected={cell.iso === value}
              today={cell.iso === today}
              inRange={inRange(cell.iso, rangeStart, rangeEnd)}
              outside={cell.outside}
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return;
                onValueChange?.(cell.iso);
              }}
            >
              {cell.day}
            </CalendarDay>
          );
        })}
      </div>
      <div className="flex h-9 items-center justify-between border-t border-border">
        <p className="text-xs text-text-3">
          {value ? formatPickerDate(value) : "Select a date"}
        </p>
        <button
          type="button"
          className="text-xs font-semibold text-accent"
          onClick={() => {
            if (!today) return;
            onValueChange?.(today);
            onMonthChange?.(today.slice(0, 7));
          }}
        >
          Today
        </button>
      </div>
    </div>
  );
}
