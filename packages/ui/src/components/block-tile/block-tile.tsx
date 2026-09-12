import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BlockTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
  grabbed?: boolean;
};

export function BlockTile({
  label,
  icon,
  grabbed = false,
  disabled,
  className,
  ...props
}: BlockTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      data-grabbed={grabbed || undefined}
      className={cn(
        "flex h-[38px] w-full items-center gap-2 rounded-sm border border-border bg-surface px-2.5 text-left transition-[background-color,border-color,box-shadow,opacity,transform] duration-150 ease-out",
        disabled
          ? "cursor-not-allowed bg-bg text-text-3"
          : "hover:border-border-strong hover:bg-bg",
        grabbed &&
          "border-accent bg-surface opacity-90 shadow-md rotate-[0.6deg] cursor-grabbing",
        !disabled && !grabbed && props.onPointerDown
          ? "touch-none cursor-grab active:cursor-grabbing"
          : null,
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex size-[15px] shrink-0 [&_svg]:size-full",
          disabled ? "text-neutral-400" : "text-text-2",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span
        className={cn(
          "truncate text-xs font-medium",
          disabled ? "text-text-3" : "text-text",
        )}
      >
        {label}
      </span>
    </button>
  );
}
