"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import {
  MoveHorizontal,
  MoveVertical,
  PanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
  Scan,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { fieldControlClass, hideNumberSpinnersClass } from "../../lib/field-control";

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
  eachSide?: boolean;
  defaultEachSide?: boolean;
  disabled?: boolean;
  onChange?: (value: PaddingSides) => void;
  onEachSideChange?: (eachSide: boolean) => void;
};

function SideField({
  icon,
  value,
  mixed = false,
  ariaLabel,
  disabled,
  onChange,
}: {
  icon: ReactNode;
  value: number;
  mixed?: boolean;
  ariaLabel: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <label
      className={fieldControlClass({
        disabled,
        className: "h-8 min-w-0 flex-1 justify-center gap-2 overflow-visible px-2.5",
      })}
    >
      <span
        className="inline-flex size-3.5 shrink-0 text-text-3 [&_svg]:size-full"
        aria-hidden
      >
        {icon}
      </span>
      <input
        type="number"
        aria-label={ariaLabel}
        value={mixed ? "" : value}
        placeholder={mixed ? "Mixed" : undefined}
        disabled={disabled}
        className={cn(
          "w-auto min-w-[1ch] bg-transparent p-0 text-xs font-medium tabular-nums leading-none text-text outline-none field-sizing-content focus-visible:shadow-none disabled:text-text-3",
          hideNumberSpinnersClass,
        )}
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
  eachSide,
  defaultEachSide = false,
  disabled = false,
  onChange,
  onEachSideChange,
  className,
  ...props
}: PaddingControlProps) {
  const [uncontrolledEachSide, setUncontrolledEachSide] = useState(
    () => defaultEachSide || value.top !== value.bottom || value.left !== value.right,
  );
  const showSides = eachSide ?? uncontrolledEachSide;
  const verticalMixed = value.top !== value.bottom;
  const horizontalMixed = value.left !== value.right;

  function setEachSide(next: boolean) {
    if (eachSide == null) {
      setUncontrolledEachSide(next);
    }
    onEachSideChange?.(next);
  }

  function setSide(side: keyof PaddingSides, next: number) {
    onChange?.({ ...value, [side]: next });
  }

  const toggle = (
    <button
      type="button"
      aria-pressed={showSides}
      aria-label="Each side"
      disabled={disabled}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-text-2 transition-[background-color,color] duration-150 disabled:opacity-50",
        showSides && "bg-accent-soft text-accent",
      )}
      onClick={() => setEachSide(!showSides)}
    >
      <Scan className="size-[15px]" strokeWidth={1.5} />
    </button>
  );

  if (showSides) {
    return (
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        <div className="flex gap-2">
          <SideField
            icon={<PanelTop strokeWidth={1.5} />}
            value={value.top}
            ariaLabel="Padding top"
            disabled={disabled}
            onChange={(next) => setSide("top", next)}
          />
          <SideField
            icon={<PanelBottom strokeWidth={1.5} />}
            value={value.bottom}
            ariaLabel="Padding bottom"
            disabled={disabled}
            onChange={(next) => setSide("bottom", next)}
          />
          {toggle}
        </div>
        <div className="flex gap-2">
          <SideField
            icon={<PanelLeft strokeWidth={1.5} />}
            value={value.left}
            ariaLabel="Padding left"
            disabled={disabled}
            onChange={(next) => setSide("left", next)}
          />
          <SideField
            icon={<PanelRight strokeWidth={1.5} />}
            value={value.right}
            ariaLabel="Padding right"
            disabled={disabled}
            onChange={(next) => setSide("right", next)}
          />
          <div className="size-8 shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", className)} {...props}>
      <SideField
        icon={<MoveVertical strokeWidth={1.5} />}
        value={value.top}
        mixed={verticalMixed}
        ariaLabel="Vertical padding"
        disabled={disabled}
        onChange={(next) => onChange?.({ ...value, top: next, bottom: next })}
      />
      <SideField
        icon={<MoveHorizontal strokeWidth={1.5} />}
        value={value.left}
        mixed={horizontalMixed}
        ariaLabel="Horizontal padding"
        disabled={disabled}
        onChange={(next) => onChange?.({ ...value, left: next, right: next })}
      />
      {toggle}
    </div>
  );
}
