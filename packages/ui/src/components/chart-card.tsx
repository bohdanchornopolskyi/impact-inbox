import type { ReactNode } from "react";
import { ChartColumn } from "lucide-react";
import { cn } from "../lib/cn";
import { SkeletonLine } from "./skeleton/skeleton";

export type ChartCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingPlot: ReactNode;
  className?: string;
  children: ReactNode;
};

export function ChartCard({
  title,
  subtitle,
  action,
  loading = false,
  isEmpty = false,
  emptyTitle = "No data yet",
  emptyDescription,
  loadingPlot,
  className,
  children,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-5 rounded-lg border border-border bg-surface p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {loading ? (
          <div className="flex flex-col gap-2 pt-0.5">
            <SkeletonLine className="h-3.5 w-[150px]" />
            <SkeletonLine className="h-3 w-[210px]" />
          </div>
        ) : (
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-text">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-text-3">{subtitle}</p>
            ) : null}
          </div>
        )}
        {!loading && action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {loading ? loadingPlot : isEmpty ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-1 rounded-lg bg-neutral-50 px-4 py-8 text-center">
          <ChartColumn
            className="size-5 text-neutral-400"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="text-sm font-medium text-text-2">{emptyTitle}</p>
          {emptyDescription ? (
            <p className="text-xs text-pretty text-text-3">{emptyDescription}</p>
          ) : null}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
