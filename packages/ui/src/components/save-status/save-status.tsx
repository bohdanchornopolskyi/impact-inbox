import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

export type SaveStatusTone = "saved" | "saving" | "unsaved" | "error" | "offline";

export type SaveStatusProps = {
  tone?: SaveStatusTone;
  label: string;
  onRetry?: () => void;
  className?: string;
};

const toneIconClass: Record<SaveStatusTone, string> = {
  saved: "text-text-3",
  saving: "text-accent",
  unsaved: "text-warning",
  error: "text-danger",
  offline: "text-text-3",
};

function CloudCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 11.5h7.2A2.8 2.8 0 0 0 12 6.2 4 4 0 0 0 5 6.5 2.7 2.7 0 0 0 4.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m6.4 9 1.3 1.3 2.4-2.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="motion-safe:animate-spin"
    >
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="22 12"
      />
    </svg>
  );
}

function CircleDotIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="1.6" fill="currentColor" />
    </svg>
  );
}

function CloudAlertIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 11.5h7.2A2.8 2.8 0 0 0 12 6.2 4 4 0 0 0 5 6.5 2.7 2.7 0 0 0 4.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 7v2M8 10.7v.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloudOffIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 11.5h7.2A2.8 2.8 0 0 0 12 6.2 4 4 0 0 0 5 6.5 2.7 2.7 0 0 0 4.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m5 5 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const toneIcon: Record<SaveStatusTone, () => ReactNode> = {
  saved: CloudCheckIcon,
  saving: LoaderIcon,
  unsaved: CircleDotIcon,
  error: CloudAlertIcon,
  offline: CloudOffIcon,
};

const toneLabelClass: Record<SaveStatusTone, string> = {
  saved: "text-text-3",
  saving: "text-text-2",
  unsaved: "text-text-2",
  error: "text-danger",
  offline: "text-text-2",
};

export function SaveStatus({
  tone = "saved",
  label,
  onRetry,
  className,
}: SaveStatusProps) {
  const Icon = toneIcon[tone];

  return (
    <div
      role="status"
      className={cn(
        "inline-flex h-control-md shrink-0 items-center gap-2 whitespace-nowrap",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.25">
        <span
          className={cn(
            "inline-flex size-icon-sm shrink-0 [&_svg]:size-full",
            toneIconClass[tone],
          )}
          aria-hidden
        >
          <Icon />
        </span>
        <p className={cn("text-xs", toneLabelClass[tone])}>{label}</p>
      </span>
      {onRetry && tone === "error" ? (
        <Button variant="link" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
