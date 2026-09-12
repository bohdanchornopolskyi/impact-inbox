import type { HTMLAttributes, ReactNode } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

export type ErrorStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: ReactNode;
  errorRef?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  title,
  description,
  errorRef,
  onRetry,
  retryLabel = "Try again",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-8 text-center",
        className,
      )}
      {...props}
    >
      <span className="inline-flex size-11 items-center justify-center rounded-lg bg-danger-50 text-danger-700 [&_svg]:size-5">
        <TriangleAlert strokeWidth={1.5} aria-hidden />
      </span>
      <p className="text-lg font-semibold text-balance text-text">{title}</p>
      {description ? (
        <div className="w-full text-sm text-pretty text-text-2">{description}</div>
      ) : null}
      {onRetry ? (
        <div className="pt-2">
          <Button
            variant="secondary"
            leftIcon={<RotateCcw strokeWidth={2} />}
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        </div>
      ) : null}
      {errorRef ? <p className="text-2xs text-text-3">{errorRef}</p> : null}
    </div>
  );
}
