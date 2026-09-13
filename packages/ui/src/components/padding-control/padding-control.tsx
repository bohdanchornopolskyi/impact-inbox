"use client";

import { useRef, type HTMLAttributes, type ReactNode } from "react";
import {
  Link,
  PanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
  Unlink,
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
  linked?: boolean;
  defaultLinked?: boolean;
  disabled?: boolean;
  onChange?: (value: PaddingSides) => void;
  onLinkedChange?: (linked: boolean) => void;
};

function SideField({
  icon,
  value,
  ariaLabel,
  disabled,
  onChange,
}: {
  icon: ReactNode;
  value: number;
  ariaLabel: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <label
      className={fieldControlClass({
        disabled,
        className: "h-8 min-w-0 justify-center gap-1.25 overflow-visible px-1",
      })}
    >
      <span
        className="inline-flex size-icon-sm shrink-0 text-text-3 [&_svg]:size-full"
        aria-hidden
      >
        {icon}
      </span>
      <input
        type="number"
        aria-label={ariaLabel}
        value={value}
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
  linked,
  defaultLinked = true,
  disabled = false,
  onChange,
  onLinkedChange,
  className,
  ...props
}: PaddingControlProps) {
  const linkedRef = useRef<HTMLInputElement>(null);

  function isLinked() {
    if (linked != null) {
      return linked;
    }
    return linkedRef.current?.checked ?? defaultLinked;
  }

  function setSide(side: keyof PaddingSides, next: number) {
    if (isLinked()) {
      onChange?.({ top: next, right: next, bottom: next, left: next });
      return;
    }
    onChange?.({ ...value, [side]: next });
  }

  return (
    <div className={cn("grid grid-cols-3 gap-1.5 p-0.5", className)} {...props}>
      <div />
      <SideField
        icon={<PanelTop strokeWidth={1.5} />}
        value={value.top}
        ariaLabel="Padding top"
        disabled={disabled}
        onChange={(next) => setSide("top", next)}
      />
      <div />
      <SideField
        icon={<PanelLeft strokeWidth={1.5} />}
        value={value.left}
        ariaLabel="Padding left"
        disabled={disabled}
        onChange={(next) => setSide("left", next)}
      />
      <div className="flex h-8 items-center justify-center">
        <label className="relative inline-flex size-8 cursor-pointer items-center justify-center rounded-sm border border-border text-text-3 transition-[background-color,border-color,color] duration-150 has-[:checked]:border-transparent has-[:checked]:bg-accent-soft has-[:checked]:text-accent has-[:disabled]:opacity-50">
          <input
            ref={linkedRef}
            type="checkbox"
            className="peer sr-only"
            disabled={disabled}
            aria-label="Link padding sides"
            {...(linked != null
              ? { checked: linked }
              : { defaultChecked: defaultLinked })}
            onChange={(event) => onLinkedChange?.(event.currentTarget.checked)}
          />
          <Link
            className="hidden size-icon-sm peer-checked:block"
            strokeWidth={1.5}
          />
          <Unlink
            className="size-icon-sm peer-checked:hidden"
            strokeWidth={1.5}
          />
        </label>
      </div>
      <SideField
        icon={<PanelRight strokeWidth={1.5} />}
        value={value.right}
        ariaLabel="Padding right"
        disabled={disabled}
        onChange={(next) => setSide("right", next)}
      />
      <div />
      <SideField
        icon={<PanelBottom strokeWidth={1.5} />}
        value={value.bottom}
        ariaLabel="Padding bottom"
        disabled={disabled}
        onChange={(next) => setSide("bottom", next)}
      />
      <div />
    </div>
  );
}
