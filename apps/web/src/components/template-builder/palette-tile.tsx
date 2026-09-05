import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { cn } from "@repo/ui/client";

type PaletteTileProps = {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  className?: string;
};

export function PaletteTile({
  label,
  icon,
  disabled,
  onClick,
  onPointerDown,
  className,
}: PaletteTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={cn(
        "flex h-[38px] w-full items-center gap-2 rounded-sm border border-border bg-surface px-2.5 text-left transition-[background-color,border-color,box-shadow,opacity,transform] duration-150 ease-out",
        disabled
          ? "cursor-not-allowed border-transparent bg-neutral-50 text-text-3"
          : "hover:border-border-strong hover:bg-neutral-50",
        !disabled && onPointerDown ? "touch-none cursor-grab active:cursor-grabbing" : null,
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex size-[15px] shrink-0 [&_svg]:size-full",
          disabled ? "text-neutral-400" : "text-text-2",
        )}
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
