import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type VersionDayHeaderProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  count: number;
};

export function VersionDayHeader({
  label,
  count,
  className,
  ...props
}: VersionDayHeaderProps) {
  return (
    <div
      className={cn("flex h-[26px] items-center gap-2.5 px-2.5", className)}
      {...props}
    >
      <p className="text-2xs font-semibold tracking-wide text-text-3 uppercase">
        {label}
      </p>
      <span className="h-px flex-1 bg-border" aria-hidden />
      <p className="text-2xs font-medium text-neutral-400">{count}</p>
    </div>
  );
}
