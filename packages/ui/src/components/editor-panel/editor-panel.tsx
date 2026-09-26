"use client";

import {
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Search, type SearchProps } from "../search/search";

export type EditorPanelProps = HTMLAttributes<HTMLDivElement>;

export function EditorPanel({ className, ...props }: EditorPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden border-r border-border bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export type EditorPanelTab = {
  value: string;
  label: string;
  icon?: ReactNode;
};

export type EditorPanelTabsProps = {
  tabs: EditorPanelTab[];
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
};

function nextTabIndex(current: number, key: string, length: number) {
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return length - 1;
  }
  if (key === "ArrowRight" || key === "ArrowDown") {
    return (current + 1) % length;
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (current - 1 + length) % length;
  }
  return current;
}

export function EditorPanelTabs({
  tabs,
  value,
  onChange,
  "aria-label": ariaLabel,
}: EditorPanelTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function activate(index: number) {
    const tab = tabs[index];
    if (!tab) {
      return;
    }
    onChange(tab.value);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const mapped = nextTabIndex(index, event.key, tabs.length);
    if (mapped === index) {
      return;
    }
    event.preventDefault();
    activate(mapped);
  }

  return (
    <div className="flex h-11.5 shrink-0 items-center border-b border-border px-3">
      <div
        className="flex w-full gap-0.5 rounded-lg bg-bg p-0.75"
        role="tablist"
        aria-label={ariaLabel}
      >
      {tabs.map((tab, index) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.value}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "inline-flex h-7 min-w-0 flex-1 items-center justify-center gap-1 rounded-sm px-1 text-[12.5px] transition-[background-color,color,box-shadow] duration-150 ease-out",
              active
                ? "bg-surface font-semibold text-text shadow-[0_1px_2px_#0f172a1f]"
                : "bg-transparent font-medium text-text-2 hover:text-text",
            )}
          >
            {tab.icon ? (
              <span className="inline-flex size-3.5 shrink-0 [&_svg]:size-full" aria-hidden>
                {tab.icon}
              </span>
            ) : null}
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}

export function EditorPanelBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
      {...props}
    />
  );
}

export function EditorPanelSearch({ className, fieldClassName, ...props }: SearchProps) {
  return (
    <div className="shrink-0 px-3 pb-3.5 pt-3">
      <Search
        {...props}
        className={cn("h-8", className)}
        fieldClassName={cn("border-border bg-bg", fieldClassName)}
      />
    </div>
  );
}

export function EditorPanelHint({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mx-3 mb-2.5 flex items-start gap-1.5 rounded-sm bg-accent-soft px-2.25 py-1.75 text-2xs leading-snug text-accent",
        className,
      )}
      {...props}
    />
  );
}

export function EditorPanelScroll({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto px-3 pb-4", className)}
      {...props}
    />
  );
}

export type EditorPanelGroupProps = HTMLAttributes<HTMLElement> & {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  action?: ReactNode;
};

const groupTitleClass =
  "flex items-center justify-between gap-2 px-0.5 text-[10.5px] font-semibold tracking-[0.8px] text-text-2 uppercase";

export function EditorPanelGroup({
  title,
  count,
  defaultOpen = true,
  action,
  className,
  children,
  ...props
}: EditorPanelGroupProps) {
  if (action) {
    return (
      <section className={className} {...props}>
        <div className={groupTitleClass}>
          <h3 className="min-w-0 truncate">{title}</h3>
          <div className="shrink-0 normal-case tracking-normal">{action}</div>
        </div>
        <div className="mt-2">{children}</div>
      </section>
    );
  }

  return (
    <details
      className={cn("group/panel open:[&>summary_svg]:rotate-180", className)}
      ref={(node) => {
        if (!node || !defaultOpen || node.dataset.opened != null) {
          return;
        }
        node.open = true;
        node.dataset.opened = "";
      }}
      {...props}
    >
      <summary
        className={cn(
          groupTitleClass,
          "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
        )}
      >
        <span className="min-w-0 truncate">
          {title}
          {count != null ? (
            <span className="ml-1.5 font-medium tracking-normal">{count}</span>
          ) : null}
        </span>
        <ChevronDown
          className="size-3.25 shrink-0 text-text-3 transition-transform duration-150 ease-out"
          strokeWidth={1.5}
          aria-hidden
        />
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

export function EditorPanelListHead({
  title,
  count,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  title: string;
  count?: number;
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-baseline justify-between gap-2 px-0.5 text-[10.5px] font-semibold tracking-[0.8px] text-text-3 uppercase",
        className,
      )}
      {...props}
    >
      <span>{title}</span>
      {count != null ? (
        <span className="font-medium tracking-normal">{count}</span>
      ) : null}
    </div>
  );
}

export function EditorPanelFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-t border-border px-3 py-2.5",
        className,
      )}
      {...props}
    />
  );
}
