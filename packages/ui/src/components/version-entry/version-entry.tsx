"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { ChevronDown, Ellipsis, Minus, Pencil, Plus } from "lucide-react";
import { cn } from "../../lib/cn";

export type VersionChange = {
  tone: "added" | "edited" | "removed";
  label: string;
};

export type VersionEntryProps = HTMLAttributes<HTMLDivElement> & {
  time: string;
  author: string;
  authorInitials: string;
  badge?: string;
  selected?: boolean;
  added?: number;
  edited?: number;
  removed?: number;
  changes?: VersionChange[];
  moreCount?: number;
  onMore?: () => void;
  onMoreChanges?: () => void;
};

const changeIcon = {
  added: Plus,
  edited: Pencil,
  removed: Minus,
} as const;

const changeIconClass = {
  added: "text-success-700",
  edited: "text-warning-700",
  removed: "text-danger-700",
} as const;

function CountChip({
  tone,
  count,
  icon,
}: {
  tone: "added" | "edited" | "removed";
  count: number;
  icon: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[17px] items-center gap-0.5 rounded-full px-1.5 text-[10.5px] font-semibold",
        tone === "added" && "bg-success-50 text-success-700",
        tone === "edited" && "bg-warning-50 text-warning-700",
        tone === "removed" && "bg-danger-50 text-danger-700",
      )}
    >
      <span className="inline-flex size-2.5 [&_svg]:size-full" aria-hidden>
        {icon}
      </span>
      {count}
    </span>
  );
}

export function VersionEntry({
  time,
  author,
  authorInitials,
  badge,
  selected = false,
  added = 0,
  edited = 0,
  removed = 0,
  changes,
  moreCount,
  onMore,
  onMoreChanges,
  className,
  ...props
}: VersionEntryProps) {
  return (
    <div
      className={cn(
        "flex min-h-[58px] gap-2.5 rounded-md px-2 transition-[background-color,color] duration-150",
        selected ? "bg-accent-soft" : "hover:bg-surface-sunken",
        className,
      )}
      {...props}
    >
      <div className="flex w-3.5 shrink-0 flex-col items-center">
        <span className="h-3.5 w-0.5 bg-border" aria-hidden />
        <span
          className={cn(
            "size-[9px] rounded-full border-2 bg-surface",
            selected ? "border-brand-200 bg-accent" : "border-border-strong",
          )}
          aria-hidden
        />
        <span className="w-0.5 flex-1 bg-border" aria-hidden />
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1", selected && "py-2.5")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.75">
            <p
              className={cn(
                "text-sm font-semibold",
                selected ? "text-brand-700" : "text-text",
              )}
            >
              {time}
            </p>
            {badge ? (
              <span
                className={cn(
                  "inline-flex h-[18px] items-center rounded-full px-1.75 text-2xs font-semibold",
                  selected
                    ? "bg-accent-hover text-text-inverse"
                    : "bg-accent-soft text-brand-700",
                )}
              >
                {badge}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Version actions"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-xs text-text-3 hover:bg-black/5"
            onClick={onMore}
          >
            <Ellipsis
              className={cn("size-icon-sm", selected && "text-accent-hover")}
              strokeWidth={1.5}
            />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex size-[18px] items-center justify-center rounded-full text-[9px] font-semibold text-accent",
              selected ? "bg-surface" : "bg-accent-soft",
            )}
            aria-hidden
          >
            {authorInitials}
          </span>
          <p className={cn("text-xs", selected ? "text-accent-hover" : "text-text-3")}>
            {author}
          </p>
          <span className="flex items-center gap-1">
            {added > 0 ? (
              <CountChip tone="added" count={added} icon={<Plus strokeWidth={2.5} />} />
            ) : null}
            {edited > 0 ? (
              <CountChip tone="edited" count={edited} icon={<Pencil strokeWidth={2.5} />} />
            ) : null}
            {removed > 0 ? (
              <CountChip
                tone="removed"
                count={removed}
                icon={<Minus strokeWidth={2.5} />}
              />
            ) : null}
          </span>
        </div>
        {selected && changes && changes.length > 0 ? (
          <div className="mt-2 flex flex-col gap-0.5 border-t border-brand-200 pt-2">
            {changes.map((change) => {
              const Icon = changeIcon[change.tone];
              return (
                <div
                  key={change.label}
                  className="flex h-[22px] items-center gap-1.75 px-1"
                >
                  <span
                    className={cn(
                      "inline-flex size-3 [&_svg]:size-full",
                      changeIconClass[change.tone],
                    )}
                    aria-hidden
                  >
                    <Icon strokeWidth={2} />
                  </span>
                  <p className="text-xs text-text">{change.label}</p>
                </div>
              );
            })}
            {moreCount ? (
              <button
                type="button"
                className="flex h-[22px] items-center gap-1.75 px-1 text-xs font-medium text-accent-hover"
                onClick={onMoreChanges}
              >
                <ChevronDown className="size-3" strokeWidth={2} />
                {moreCount} more changes
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
