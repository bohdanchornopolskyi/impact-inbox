import { cn } from "../../lib/cn";

export type SkeletonLineProps = {
  className?: string;
};

export function SkeletonLine({ className }: SkeletonLineProps) {
  return <div className={cn("h-3 rounded-full bg-surface-sunken", className)} />;
}

export type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-4",
        className,
      )}
    >
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-40" />
      <SkeletonLine className="w-27.5" />
    </div>
  );
}
