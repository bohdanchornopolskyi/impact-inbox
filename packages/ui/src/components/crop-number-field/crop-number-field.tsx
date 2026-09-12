import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type CropNumberFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  prefix: string;
  unit?: string;
};

export function CropNumberField({
  prefix,
  unit = "px",
  className,
  "aria-label": ariaLabel,
  ...props
}: CropNumberFieldProps) {
  return (
    <label
      className={cn(
        "inline-flex h-8 w-[100px] items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-2.5",
        className,
      )}
    >
      <span className="text-[11.5px] font-semibold text-text-3">{prefix}</span>
      <input
        type="number"
        className="min-w-0 flex-1 bg-transparent text-[12.5px] font-medium text-text outline-none"
        {...props}
        aria-label={ariaLabel ?? prefix}
      />
      <span className="text-2xs text-text-3">{unit}</span>
    </label>
  );
}
