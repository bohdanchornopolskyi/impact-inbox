"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import {
  fieldControlClass,
  fieldInputClass,
  hideNumberSpinnersClass,
} from "../../lib/field-control";

export type UnitFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  unit?: string;
};

export function UnitField({
  unit = "px",
  className,
  disabled,
  readOnly,
  ...props
}: UnitFieldProps) {
  return (
    <div
      className={fieldControlClass({
        disabled,
        readOnly,
        className: "h-control-md",
      })}
    >
      <input
        type="number"
        disabled={disabled}
        readOnly={readOnly}
        className={cn(
          fieldInputClass,
          "tabular-nums",
          hideNumberSpinnersClass,
          className,
        )}
        {...props}
      />
      <span className="pr-3 text-xs text-text-3">{unit}</span>
    </div>
  );
}
