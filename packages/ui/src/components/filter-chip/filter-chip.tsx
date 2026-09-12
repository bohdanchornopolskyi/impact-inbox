import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "../../lib/cn";

export type FilterChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "value"
> & {
  label: string;
  value: string;
  active?: boolean;
  icon?: ReactNode;
  onClear?: MouseEventHandler<HTMLButtonElement>;
};

export function FilterChip({
  label,
  value,
  active = false,
  icon,
  onClear,
  className,
  ...props
}: FilterChipProps) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5",
        active
          ? "border-brand-300 bg-accent-soft"
          : "border-border-strong bg-surface",
        className,
      )}
    >
      <button
        {...props}
        type="button"
        className="inline-flex min-w-0 items-center gap-1.5 text-sm leading-none"
      >
        <span className={active ? "text-brand-600" : "text-text-3"}>{label}</span>
        <span
          className={cn(
            "truncate",
            active ? "font-semibold text-brand-700" : "font-medium text-text",
          )}
        >
          {value}
        </span>
        {active ? null : (
          <span className="inline-flex size-icon-sm text-text-3 [&_svg]:size-full" aria-hidden>
            {icon ?? <ChevronDown strokeWidth={1.5} />}
          </span>
        )}
      </button>
      {active ? (
        <button
          type="button"
          aria-label={`Clear ${label}`}
          className="inline-flex size-[13px] shrink-0 text-brand-600 [&_svg]:size-full"
          onClick={onClear}
        >
          <X strokeWidth={1.5} />
        </button>
      ) : null}
    </div>
  );
}
