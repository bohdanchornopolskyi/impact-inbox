import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type MetricTileProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  delta?: string;
  deltaTone?: "success" | "danger" | "neutral";
  period?: string;
  className?: string;
};

const deltaClass = {
  success: "text-success-700",
  danger: "text-danger-700",
  neutral: "text-text-3",
} as const;

function TrendingUpIcon() {
  return (
    <svg viewBox="0 0 13 13" fill="none" aria-hidden>
      <path
        d="M1.5 9.5 5.2 5.8l2.3 2.3 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 4.1h3.4V7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg viewBox="0 0 13 13" fill="none" aria-hidden>
      <path
        d="M1.5 3.5 5.2 7.2l2.3-2.3 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.9h3.4V5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MetricTile({
  label,
  value,
  icon,
  delta,
  deltaTone = "success",
  period,
  className,
}: MetricTileProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-text-2">{label}</p>
        {icon ? (
          <span className="inline-flex size-icon-sm text-text-3 [&_svg]:size-full" aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="text-3xl font-bold text-text">{value}</p>
      {delta || period ? (
        <div className="flex items-center gap-1.25">
          {delta ? (
            <>
              <span
                className={cn(
                  "inline-flex size-3.25 shrink-0 [&_svg]:size-full",
                  deltaClass[deltaTone],
                )}
                aria-hidden
              >
                {deltaTone === "danger" ? <TrendingDownIcon /> : <TrendingUpIcon />}
              </span>
              <p className={cn("text-xs font-semibold", deltaClass[deltaTone])}>{delta}</p>
            </>
          ) : null}
          {period ? <p className="text-xs text-text-3">{period}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
