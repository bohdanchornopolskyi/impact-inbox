import { cn } from "../../lib/cn";

function Mark({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 6 L10 11 L17 6 M3 6 L3 14.5 A0.5 0.5 0 0 0 3.5 15 H16.5 A0.5 0.5 0 0 0 17 14.5 V6"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type LogoProps = {
  centered?: boolean;
  compact?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  centered = false,
  compact = false,
  href,
  className,
}: LogoProps) {
  const content = (
    <div
      className={cn(
        "flex items-center",
        compact ? "gap-2" : "justify-center gap-2.5",
        centered && "mb-logo-gap",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-accent shadow-accent",
          compact ? "size-[26px] rounded-[7px]" : "size-8 rounded-[9px]",
        )}
      >
        <Mark size={compact ? 14 : 17} />
      </span>
      <span
        className={cn(
          "font-semibold tracking-tight text-text-primary",
          compact ? "text-[15px] leading-none" : "text-ui-xl",
        )}
      >
        Impact Inbox
      </span>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} className="no-underline hover:[&_span:last-child]:text-accent-deep">
      {content}
    </a>
  );
}
