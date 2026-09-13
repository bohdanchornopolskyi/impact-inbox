"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { fieldControlClass } from "../../lib/field-control";

export type ColorInputProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  hex: string;
  alpha?: number;
};

function ColorInputSwatch({ hex, alpha }: { hex: string; alpha: number }) {
  return (
    <span
      className={cn(
        "relative size-[22px] shrink-0 overflow-hidden rounded-[5px] shadow-[inset_0_0_0_1px_rgb(15_23_42/0.12)]",
        hex === "#ffffff" && "border border-border-strong",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "conic-gradient(#d2d6dc 25%, #ffffff 0 50%, #d2d6dc 0 75%, #ffffff 0)",
          backgroundSize: "8px 8px",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: hex, opacity: alpha }}
      />
    </span>
  );
}

export function ColorInput({
  hex,
  alpha = 1,
  className,
  disabled,
  ...props
}: ColorInputProps) {
  const digits = hex.replace("#", "").toUpperCase();

  return (
    <button
      type="button"
      disabled={disabled}
      className={fieldControlClass({
        disabled,
        className: cn("h-control-md w-full gap-2 px-1 text-left", className),
      })}
      {...props}
    >
      <ColorInputSwatch hex={hex.startsWith("#") ? hex : `#${hex}`} alpha={alpha} />
      <span className="min-w-0 flex-1 font-mono text-xs font-medium tabular-nums text-text">
        {digits}
      </span>
      <span className="pr-2 text-[11px] tabular-nums text-text-3">
        {Math.round(alpha * 100)}%
      </span>
    </button>
  );
}
