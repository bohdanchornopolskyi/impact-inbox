"use client";

import type { ReactNode } from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cn } from "../../lib/cn";

export type CollapsibleSectionProps = {
  title: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 6.5 8 10.5 12 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CollapsibleSection({
  title,
  summary,
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  return (
    <BaseCollapsible.Root
      defaultOpen={defaultOpen}
      className={cn("border-b border-border", className)}
    >
      <BaseCollapsible.Trigger className="group flex h-10.25 w-full shrink-0 items-center justify-between gap-2 px-4 text-left outline-none focus-visible:shadow-(--shadow-ring-accent)">
        <span className="min-w-0 truncate text-[12.5px] leading-3.75 font-semibold text-text">
          {title}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          {summary ? (
            <span className="max-w-32 truncate text-xs font-medium text-text-3 group-data-panel-open:hidden">
              {summary}
            </span>
          ) : null}
          <span className="inline-flex size-3.5 text-text-3 transition-transform duration-150 ease-out group-data-panel-open:rotate-180 [&_svg]:size-full">
            <ChevronIcon />
          </span>
        </span>
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0 [&[hidden]:not([hidden='until-found'])]:hidden">
        <div className="px-4 pt-1 pb-4">{children}</div>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}

export { BaseCollapsible as Collapsible };
