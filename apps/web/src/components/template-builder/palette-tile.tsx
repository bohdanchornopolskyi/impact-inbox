import type { ReactNode } from "react";
import { cn } from "@repo/ui/client";

type PaletteTileProps = {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

export function PaletteTile({
  label,
  icon,
  disabled,
  onClick,
  className,
}: PaletteTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border-default bg-surface-muted px-2 py-2.5 text-center transition-colors hover:border-accent-border hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="text-ui-xs font-medium text-text-primary">{label}</span>
    </button>
  );
}
