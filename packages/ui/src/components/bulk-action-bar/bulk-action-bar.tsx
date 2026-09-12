import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export type BulkActionBarProps = HTMLAttributes<HTMLDivElement> & {
  selectedLabel: string;
  onDismiss?: () => void;
  children?: ReactNode;
};

export function BulkActionBar({
  selectedLabel,
  onDismiss,
  children,
  className,
  ...props
}: BulkActionBarProps) {
  return (
    <div
      className={cn(
        "inline-flex h-[52px] items-center gap-2 rounded-lg bg-neutral-900 px-3",
        className,
      )}
      {...props}
    >
      <span className="inline-flex h-[26px] items-center rounded-full bg-white/[.12] px-2.5 text-xs font-semibold text-text-inverse">
        {selectedLabel}
      </span>
      <span className="h-[22px] w-px bg-neutral-700" aria-hidden />
      {children}
      <span className="h-[22px] w-px bg-neutral-700" aria-hidden />
      <button
        type="button"
        aria-label="Dismiss"
        className="inline-flex size-[30px] items-center justify-center rounded-sm text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-text-inverse"
        onClick={onDismiss}
      >
        <X className="size-icon-sm" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export type BulkActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  destructive?: boolean;
};

export function BulkAction({
  icon,
  destructive = false,
  className,
  children,
  ...props
}: BulkActionProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-[7px] rounded-sm px-2.5 text-sm font-medium transition-colors duration-150 hover:bg-white/10",
        destructive ? "text-danger-200" : "text-text-inverse",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          className={cn(
            "inline-flex size-icon-sm [&_svg]:size-full",
            destructive ? "text-danger-200" : "text-white/70",
          )}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
