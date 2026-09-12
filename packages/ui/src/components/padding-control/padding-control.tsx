"use client";

import type { HTMLAttributes, ReactNode } from "react";
import {
  Link,
  PanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
  Unlink,
} from "lucide-react";
import { cn } from "../../lib/cn";

export type PaddingSides = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type PaddingControlProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  value: PaddingSides;
  linked?: boolean;
  onChange?: (value: PaddingSides) => void;
  onLinkedChange?: (linked: boolean) => void;
};

function SideField({
  icon,
  value,
  ariaLabel,
  onChange,
}: {
  icon: ReactNode;
  value: number;
  ariaLabel: string;
  onChange?: (value: number) => void;
}) {
  return (
    <label className="flex h-8 min-w-0 items-center justify-center gap-1.25 rounded-sm border border-border-strong bg-surface px-1">
      <span className="inline-flex size-icon-sm text-text-3 [&_svg]:size-full" aria-hidden>
        {icon}
      </span>
      <input
        type="number"
        aria-label={ariaLabel}
        value={value}
        className="w-full min-w-0 bg-transparent text-center text-xs font-medium text-text outline-none"
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) {
            onChange?.(next);
          }
        }}
      />
    </label>
  );
}

export function PaddingControl({
  value,
  linked = true,
  onChange,
  onLinkedChange,
  className,
  ...props
}: PaddingControlProps) {
  function setSide(side: keyof PaddingSides, next: number) {
    if (linked) {
      onChange?.({ top: next, right: next, bottom: next, left: next });
      return;
    }
    onChange?.({ ...value, [side]: next });
  }

  return (
    <div className={cn("grid grid-cols-3 gap-1.5", className)} {...props}>
      <div />
      <SideField
        icon={<PanelTop strokeWidth={1.5} />}
        value={value.top}
        ariaLabel="Padding top"
        onChange={(next) => setSide("top", next)}
      />
      <div />
      <SideField
        icon={<PanelLeft strokeWidth={1.5} />}
        value={value.left}
        ariaLabel="Padding left"
        onChange={(next) => setSide("left", next)}
      />
      <button
        type="button"
        aria-pressed={linked}
        aria-label={linked ? "Unlink padding sides" : "Link padding sides"}
        className={cn(
          "inline-flex size-8 items-center justify-center justify-self-center rounded-sm transition-[background-color,border-color,color] duration-150",
          linked
            ? "bg-accent-soft text-accent"
            : "border border-border bg-transparent text-text-3",
        )}
        onClick={() => onLinkedChange?.(!linked)}
      >
        {linked ? (
          <Link className="size-icon-sm" strokeWidth={1.5} />
        ) : (
          <Unlink className="size-icon-sm" strokeWidth={1.5} />
        )}
      </button>
      <SideField
        icon={<PanelRight strokeWidth={1.5} />}
        value={value.right}
        ariaLabel="Padding right"
        onChange={(next) => setSide("right", next)}
      />
      <div />
      <SideField
        icon={<PanelBottom strokeWidth={1.5} />}
        value={value.bottom}
        ariaLabel="Padding bottom"
        onChange={(next) => setSide("bottom", next)}
      />
      <div />
    </div>
  );
}
