"use client";

import type { InputHTMLAttributes } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { fieldControlClass, hideNumberSpinnersClass } from "../../lib/field-control";

export type StepperProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "onChange"
> & {
  unit?: string;
  value: number;
  step?: number;
  onValueChange?: (value: number) => void;
};

export function Stepper({
  unit = "px",
  value,
  step = 1,
  min,
  max,
  disabled,
  onValueChange,
  className,
  ...props
}: StepperProps) {
  const minValue = typeof min === "number" ? min : Number.NEGATIVE_INFINITY;
  const maxValue = typeof max === "number" ? max : Number.POSITIVE_INFINITY;

  function clamp(next: number) {
    return Math.min(maxValue, Math.max(minValue, next));
  }

  return (
    <div
      className={fieldControlClass({
        disabled,
        className: cn("h-control-md", className),
      })}
    >
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabled || value <= minValue}
        className="inline-flex size-control-sm shrink-0 items-center justify-center text-text-2 transition-colors duration-150 hover:bg-bg disabled:text-text-3"
        onClick={() => onValueChange?.(clamp(value - step))}
      >
        <Minus className="size-3.5" strokeWidth={1.5} />
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          disabled={disabled}
          value={value}
          className={cn(
            "w-10 bg-transparent text-center text-xs font-medium tabular-nums text-text outline-none",
            hideNumberSpinnersClass,
          )}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) {
              onValueChange?.(clamp(next));
            }
          }}
          {...props}
        />
        {unit ? <span className="text-[11.5px] text-text-3">{unit}</span> : null}
      </div>
      <button
        type="button"
        aria-label="Increase"
        disabled={disabled || value >= maxValue}
        className="inline-flex size-control-sm shrink-0 items-center justify-center text-text-2 transition-colors duration-150 hover:bg-bg disabled:text-text-3"
        onClick={() => onValueChange?.(clamp(value + step))}
      >
        <Plus className="size-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
