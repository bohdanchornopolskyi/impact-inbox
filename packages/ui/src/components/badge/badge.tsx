import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand"
  | "accent";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  icon?: ReactNode | boolean;
  dot?: boolean;
  children: ReactNode;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-text-2",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  info: "bg-info-50 text-info-700",
  brand: "bg-accent-soft text-brand-700",
  accent: "bg-accent-soft text-brand-700",
};

function CircleIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="3.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CircleCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.9 6.15 5.25 7.5 8.1 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircleAlertIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 4v2.5M6 8.15v.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CircleXIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m4.4 4.4 3.2 3.2M7.6 4.4l-3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 5.6v2.4M6 4.1v.35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1.5 6.7 4.3 9.5 5 6.7 5.7 6 8.5 5.3 5.7 2.5 5 5.3 4.3 6 1.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 7.4 9.7 8.6 10.9 8.9 9.7 9.2 9.4 10.4 9.1 9.2 7.9 8.9 9.1 8.6 9.4 7.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

const toneIcon: Record<BadgeTone, () => ReactNode> = {
  neutral: CircleIcon,
  success: CircleCheckIcon,
  warning: CircleAlertIcon,
  danger: CircleXIcon,
  info: InfoIcon,
  brand: SparklesIcon,
  accent: SparklesIcon,
};

export function Badge({
  tone = "neutral",
  icon,
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const resolvedTone = tone === "accent" ? "brand" : tone;
  const DefaultIcon = toneIcon[resolvedTone];
  const showDefault = icon === undefined || icon === true;
  const customIcon = typeof icon === "boolean" ? null : icon;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.25 rounded-full px-2.25 text-2xs font-semibold leading-none",
        toneClasses[resolvedTone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      ) : customIcon ? (
        <span className="inline-flex size-3 shrink-0 [&_svg]:size-full" aria-hidden>
          {customIcon}
        </span>
      ) : showDefault ? (
        <span className="inline-flex size-3 shrink-0 [&_svg]:size-full" aria-hidden>
          <DefaultIcon />
        </span>
      ) : null}
      {children}
    </span>
  );
}
