import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type FilterBarProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function FilterBar({ children, className, ...props }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2 rounded-lg border border-border bg-surface px-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FilterBarSpacer({ className }: { className?: string }) {
  return <div className={cn("h-px min-w-0 flex-1", className)} />;
}

export function FilterBarCount({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("text-xs text-text-3", className)}>{children}</p>;
}

export function FilterBarRule({ className }: { className?: string }) {
  return <div className={cn("h-5 w-px bg-border", className)} />;
}
