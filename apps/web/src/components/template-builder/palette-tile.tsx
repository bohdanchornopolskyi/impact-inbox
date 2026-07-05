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
        "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border-default bg-surface-muted px-2 py-2.5 text-center transition-colors hover:border-accent-border hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50",
        !disabled && onPointerDown ? "touch-none cursor-grab active:cursor-grabbing" : null,
        className,
      )}
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="text-ui-xs font-medium text-text-primary">{label}</span>
    </button>
  );
}
