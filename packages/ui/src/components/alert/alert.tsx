import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

export type AlertProps = {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
};

const toneIconClass: Record<AlertTone, string> = {
  info: "text-info-500",
  success: "text-success-500",
  warning: "text-warning-500",
  danger: "text-danger-500",
};

const toneActionClass: Record<AlertTone, string> = {
  info: "text-info-700",
  success: "text-success-700",
  warning: "text-warning-700",
  danger: "text-danger-700",
};

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 7.25v4M8 5.25v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 8.2 7.2 10l3.4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.75 13.5 12.5h-11L8 2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 6.5v3M8 11.25v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DangerIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 6l4 4M10 6l-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const toneIcon: Record<AlertTone, () => ReactNode> = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 6h7M6.5 3.5 9.5 6 6.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DismissIcon() {
  return (
    <svg viewBox="0 0 13 13" fill="none" aria-hidden>
      <path
        d="M3 3l7 7M10 3l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
  action,
  onDismiss,
  className,
}: AlertProps) {
  const Icon = toneIcon[tone];
  const isAssertive = tone === "danger" || tone === "warning";

  return (
    <div
      role={isAssertive ? "alert" : "status"}
      className={cn(
        "flex w-full gap-2.75 rounded-md border border-border bg-surface p-3.5",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-icon-md shrink-0 [&_svg]:size-full",
          toneIconClass[tone],
        )}
        aria-hidden
      >
        <Icon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.25">
        <p className="text-sm font-semibold text-text">{title}</p>
        {children ? (
          <div className="text-xs text-text-2">{children}</div>
        ) : null}
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(
              "inline-flex w-fit items-center gap-1 text-xs font-semibold transition-colors duration-150 ease-out",
              toneActionClass[tone],
            )}
          >
            {action.label}
            <span className="inline-flex size-3 [&_svg]:size-full" aria-hidden>
              <ArrowIcon />
            </span>
          </button>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="relative inline-flex size-5 shrink-0 items-center justify-center rounded-xs text-text-3 transition-[background-color] duration-150 ease-out before:absolute before:-inset-0.5 hover:bg-surface-sunken"
        >
          <DismissIcon />
        </button>
      ) : null}
    </div>
  );
}
