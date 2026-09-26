"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ColorInput, type ColorInputProps } from "../color-input/color-input";

export const COLOR_FIELD_SWATCHES = [
  "#0F172A",
  "#4F46E5",
  "#F8FAFC",
  "#E7EBF0",
  "#15A34A",
  "#F59E0B",
] as const;

export type ColorFieldProps = Omit<ColorInputProps, "hex"> & {
  hex: string;
  swatches?: readonly string[];
  onSwatch?: (hex: string) => void;
  children?: ReactNode;
};

export function ColorField({
  hex,
  swatches = COLOR_FIELD_SWATCHES,
  onSwatch,
  children,
  className,
  disabled,
  ...props
}: ColorFieldProps) {
  const selected = hex.replace("#", "").toLowerCase();

  return (
    <div className="flex flex-col gap-2">
      {children ?? (
        <ColorInput
          hex={hex}
          disabled={disabled}
          className={cn("h-8", className)}
          {...props}
        />
      )}
      <div className="flex items-center gap-1.5">
        {swatches.slice(0, 6).map((color) => {
          const active = color.replace("#", "").toLowerCase() === selected;
          return (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={active}
              disabled={disabled}
              className={cn(
                "size-[22px] shrink-0 rounded-[5px] shadow-[inset_0_0_0_1px_rgb(15_23_42/0.12)]",
                active && "shadow-[0_0_0_2px_var(--color-accent)]",
              )}
              style={{ backgroundColor: color }}
              onClick={() => onSwatch?.(color)}
            />
          );
        })}
        <span className="ml-auto text-[11.5px] text-text-2">Brand</span>
      </div>
    </div>
  );
}
