import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  chartMax,
  formatTick,
  isChartEmpty,
  niceTicks,
  type ChartDatum,
} from "../../lib/chart-scale";
import { ChartCard } from "../chart-card";

export type { ChartDatum };

export type BarChartProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  data: ChartDatum[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

const LOADING_HEIGHTS = [38, 52, 44, 63, 78, 70, 90, 83, 60, 55, 72, 94, 100, 79];

export function BarChart({
  title,
  subtitle,
  action,
  data,
  loading = false,
  emptyTitle = "No data yet",
  emptyDescription,
  className,
}: BarChartProps) {
  const ticks = niceTicks(chartMax(data));
  const top = ticks[0] ?? 1;
  const peak = chartMax(data);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      action={action}
      loading={loading}
      isEmpty={isChartEmpty(data)}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      loadingPlot={<LoadingBars />}
      className={className}
    >
      <div className="flex h-[180px] gap-2">
        <div
          className="flex w-9 shrink-0 flex-col justify-between py-px text-right text-2xs text-text-3"
          aria-hidden
        >
          {ticks.map((tick) => (
            <span key={tick}>{formatTick(tick)}</span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 items-end gap-1">
          {data.map((item) => {
            const height = top <= 0 ? 0 : (Math.max(0, item.value) / top) * 100;
            const isPeak = item.value === peak && peak > 0;
            return (
              <div
                key={item.label}
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                <div
                  className={cn(
                    "w-full rounded-t-sm",
                    isPeak ? "bg-accent" : "bg-brand-200",
                  )}
                  style={{
                    height: `${height}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-9 shrink-0" aria-hidden />
        <div className="flex min-w-0 flex-1 gap-1">
          {data.map((item) => (
            <span
              key={item.label}
              className="min-w-0 flex-1 truncate text-center text-2xs text-text-3"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartCard>
  );
}

function LoadingBars() {
  return (
    <div className="flex h-[180px] items-end gap-1" aria-hidden>
      {LOADING_HEIGHTS.map((height, index) => (
        <div
          key={index}
          className="min-w-0 flex-1 rounded-t-sm bg-surface-sunken"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
