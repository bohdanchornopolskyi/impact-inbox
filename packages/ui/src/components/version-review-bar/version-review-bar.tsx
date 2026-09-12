"use client";

import type { HTMLAttributes } from "react";
import { ChevronDown, ChevronUp, Copy, History, RotateCcw, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

export type VersionReviewBarProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  note?: string;
  changeCount: number;
  onPrevChange?: () => void;
  onNextChange?: () => void;
  onExit?: () => void;
  onSaveCopy?: () => void;
  onRestore?: () => void;
};

export function VersionReviewBar({
  title,
  note = "Read-only preview",
  changeCount,
  onPrevChange,
  onNextChange,
  onExit,
  onSaveCopy,
  onRestore,
  className,
  ...props
}: VersionReviewBarProps) {
  return (
    <div
      className={cn(
        "flex h-11 items-center justify-between gap-3 bg-accent-soft px-4",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2.25">
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm bg-brand-100 text-brand-700">
          <History className="size-icon-sm" strokeWidth={1.5} aria-hidden />
        </span>
        <p className="truncate text-sm font-semibold text-brand-700">{title}</p>
        <span className="size-0.75 shrink-0 rounded-full bg-brand-300" aria-hidden />
        <p className="shrink-0 text-xs text-accent-hover">{note}</p>
      </div>
      <div className="inline-flex h-[30px] items-center gap-1 rounded-full border border-brand-200 bg-surface py-0 pr-2.5 pl-1">
        <button
          type="button"
          aria-label="Previous change"
          className="inline-flex size-[22px] items-center justify-center rounded-full text-text-2 hover:bg-surface-sunken"
          onClick={onPrevChange}
        >
          <ChevronUp className="size-[13px]" strokeWidth={1.5} />
        </button>
        <span className="flex items-center gap-0.75" aria-hidden>
          <span className="size-1.5 rounded-full bg-success" />
          <span className="size-1.5 rounded-full bg-warning" />
          <span className="size-1.5 rounded-full bg-danger" />
        </span>
        <p className="text-xs font-medium text-text">
          {changeCount} changes in this version
        </p>
        <button
          type="button"
          aria-label="Next change"
          className="inline-flex size-[22px] items-center justify-center rounded-full text-text-2 hover:bg-surface-sunken"
          onClick={onNextChange}
        >
          <ChevronDown className="size-[13px]" strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-[30px] text-brand-700"
          leftIcon={<X strokeWidth={2} />}
          onClick={onExit}
        >
          Exit history
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-[30px]"
          leftIcon={<Copy strokeWidth={2} />}
          onClick={onSaveCopy}
        >
          Save as copy
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="h-[30px]"
          leftIcon={<RotateCcw strokeWidth={2} />}
          onClick={onRestore}
        >
          Restore this version
        </Button>
      </div>
    </div>
  );
}
