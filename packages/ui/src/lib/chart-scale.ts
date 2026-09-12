export type ChartDatum = {
  label: string;
  value: number;
  color?: string;
};

export const CHART_SERIES_COLORS = [
  "var(--color-accent)",
  "var(--color-brand-300)",
  "var(--color-neutral-200)",
  "var(--color-warning)",
] as const;

export function chartTotal(data: readonly ChartDatum[]): number {
  return data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
}

export function chartPercents(data: readonly ChartDatum[]): number[] {
  const total = chartTotal(data);
  if (total <= 0) {
    return data.map(() => 0);
  }
  return data.map((item) => (Math.max(0, item.value) / total) * 100);
}

export function chartMax(data: readonly ChartDatum[]): number {
  return data.reduce((max, item) => Math.max(max, item.value), 0);
}

export function niceTicks(maxValue: number, tickCount = 4): number[] {
  if (maxValue <= 0) {
    return [4, 3, 2, 1, 0];
  }

  const rough = maxValue / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const nice =
    residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  const step = nice * magnitude;
  const top = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = top; value >= 0; value -= step) {
    ticks.push(value);
  }
  return ticks;
}

export function formatTick(value: number): string {
  if (value >= 1000) {
    const thousands = value / 1000;
    const rounded =
      thousands >= 10 || value % 1000 === 0
        ? String(Math.round(thousands))
        : thousands.toFixed(1).replace(/\.0$/, "");
    return `${rounded}k`;
  }
  return String(value);
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export function formatChartNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

export function isChartEmpty(data: readonly ChartDatum[]): boolean {
  return data.length === 0 || chartMax(data) <= 0;
}

export function seriesColor(data: readonly ChartDatum[], index: number): string {
  return data[index]?.color ?? CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]!;
}
