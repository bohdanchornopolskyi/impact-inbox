import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

function InboxIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.5 10.5 6.2 5.8A1.5 1.5 0 0 1 7.5 5h5a1.5 1.5 0 0 1 1.3.8l2.7 4.7v4.2A1.5 1.5 0 0 1 15 16.5H5A1.5 1.5 0 0 1 3.5 15v-4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 10.5h3.2l.8 1.5h5l.8-1.5h3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-8 text-center",
        className,
      )}
    >
      <span className="inline-flex size-11 items-center justify-center rounded-lg bg-surface-sunken text-text-3 [&_svg]:size-5">
        {icon ?? <InboxIcon />}
      </span>
      <p className="text-lg font-semibold text-text">{title}</p>
      {description ? (
        <div className="w-full text-sm text-text-2">{description}</div>
      ) : null}
      {action}
    </div>
  );
}
