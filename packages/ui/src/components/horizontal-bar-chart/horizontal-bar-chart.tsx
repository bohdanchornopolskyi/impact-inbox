import { cn } from "../../lib/cn";
import {
  chartMax,
  formatChartNumber,
  isChartEmpty,
  type ChartDatum,
} from "../../lib/chart-scale";
import { ChartCard } from "../chart-card";

export type { ChartDatum };

export type HorizontalBarChartProps = {
  title: string;
  subtitle?: string;
  data: ChartDatum[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function HorizontalBarChart({
  title,
  subtitle,
  data,
  loading = false,
  emptyTitle = "No data yet",
  emptyDescription,
  className,
}: HorizontalBarChartProps) {
  const peak = chartMax(data);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      loading={loading}
      isEmpty={isChartEmpty(data)}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      loadingPlot={<LoadingRows />}
      className={className}
    >
      <ul className="flex flex-col gap-4">
        {data.map((item, index) => {
          const width = peak <= 0 ? 0 : (item.value / peak) * 100;
          return (
            <li key={item.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm text-text-2">{item.label}</p>
                <p className="tabular-nums text-sm font-medium text-text">
                  {formatChartNumber(item.value)}
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className={cn(
                    "h-full rounded-full",
                    index === 0 ? "bg-accent" : "bg-brand-300",
                  )}
                  style={{
                    width: `${width}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
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

function LoadingRows() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {[100, 72, 48, 28].map((width) => (
        <div key={width} className="flex flex-col gap-1.5">
          <div className="h-4 w-40 rounded-full bg-surface-sunken" />
          <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-neutral-200"
              style={{ width: `${width}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
