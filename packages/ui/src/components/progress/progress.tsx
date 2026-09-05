import { cn } from "../../lib/cn";

export type ProgressProps = {
  label: string;
  valueLabel?: string;
  value: number;
  max?: number;
  className?: string;
};

export function Progress({
  label,
  valueLabel,
  value,
  max = 100,
  className,
}: ProgressProps) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-text-2">{label}</p>
        {valueLabel ? <p className="text-xs text-text-3">{valueLabel}</p> : null}
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
