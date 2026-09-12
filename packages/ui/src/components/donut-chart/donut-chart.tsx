import { cn } from "../../lib/cn";
import {
  chartPercents,
  formatChartNumber,
  isChartEmpty,
  seriesColor,
  type ChartDatum,
} from "../../lib/chart-scale";
import { ChartCard } from "../chart-card";

export type { ChartDatum };

export type DonutChartProps = {
  title: string;
  subtitle?: string;
  data: ChartDatum[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function DonutChart({
  title,
  subtitle,
  data,
  loading = false,
  emptyTitle = "No data yet",
  emptyDescription,
  className,
}: DonutChartProps) {
  const percents = chartPercents(data);
  const focusIndex = data.reduce((best, item, index) => {
    if (item.value > (data[best]?.value ?? -1)) {
      return index;
    }
    return best;
  }, 0);
  const focus = data[focusIndex];
  const focusPercent = Math.round(percents[focusIndex] ?? 0);

  let cursor = 0;
  const stops = data.map((item, index) => {
    const start = cursor;
    cursor += percents[index] ?? 0;
    return `${seriesColor(data, index)} ${start}% ${cursor}%`;
  });

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      loading={loading}
      isEmpty={isChartEmpty(data)}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      loadingPlot={<LoadingDonut />}
      className={className}
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative size-[168px] shrink-0">
          <div
            className="size-full rounded-full"
            style={{
              background: `conic-gradient(from -90deg, ${stops.join(", ")})`,
              mask: "radial-gradient(farthest-side, transparent 63.5%, #000 64%)",
              WebkitMask:
                "radial-gradient(farthest-side, transparent 63.5%, #000 64%)",
            }}
            aria-hidden
          />
          {focus ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold tabular-nums text-text">
                {focusPercent}%
              </p>
              <p className="text-xs text-text-3">{focus.label.toLowerCase()}</p>
            </div>
          ) : null}
        </div>
        <ul className="flex min-w-[212px] flex-1 flex-col gap-2">
          {data.map((item, index) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="size-[9px] shrink-0 rounded-full"
                style={{ backgroundColor: seriesColor(data, index) }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-text-2">
                {item.label}
              </span>
              <span className="tabular-nums font-medium text-text">
                {Math.round(percents[index] ?? 0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>
                {formatChartNumber(item.value)} (
                {Math.round(percents[index] ?? 0)}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartCard>
  );
}

function LoadingDonut() {
  return (
    <div className="flex flex-wrap items-center gap-5" aria-hidden>
      <div
        className="size-[168px] rounded-full bg-surface-sunken"
        style={{
          mask: "radial-gradient(farthest-side, transparent 63.5%, #000 64%)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent 63.5%, #000 64%)",
        }}
      />
      <div className="flex min-w-[212px] flex-1 flex-col gap-3">
        {["w-40", "w-36", "w-32", "w-28"].map((width) => (
          <div
            key={width}
            className={cn("h-4 rounded-full bg-surface-sunken", width)}
          />
        ))}
      </div>
    </div>
  );
}
