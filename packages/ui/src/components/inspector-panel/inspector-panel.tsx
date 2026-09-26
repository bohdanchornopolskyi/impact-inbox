"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { inspectorControlClass } from "../inspector-row/inspector-row";
import {
  SegmentedControl,
  type SegmentedControlOption,
} from "../segmented-control/segmented-control";

export type InspectorPanelProps = HTMLAttributes<HTMLDivElement>;

export function InspectorPanel({ className, ...props }: InspectorPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden border-l border-border bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export type InspectorPanelTabsProps = {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
  disabled?: boolean;
};

export function InspectorPanelTabs({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  disabled,
}: InspectorPanelTabsProps) {
  return (
    <div className="flex h-11.5 shrink-0 items-center border-b border-border px-3">
      <SegmentedControl
        aria-label={ariaLabel}
              className={inspectorControlClass}
        value={value}
        disabled={disabled}
        onChange={onChange}
        options={options}
      />
    </div>
  );
}

export type InspectorPanelHeaderProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  title: string;
  context?: string;
  actions?: ReactNode;
};

export function InspectorPanelHeader({
  icon,
  title,
  context,
  actions,
  className,
  ...props
}: InspectorPanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3.5",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent [&_svg]:size-3.75">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-md font-semibold text-text">{title}</p>
        {context ? (
          <p className="truncate text-[11.5px] text-text-2">{context}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
      ) : null}
    </div>
  );
}

export function InspectorPanelBody({
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

export function InspectorPanelScroll({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto", className)}
      {...props}
    />
  );
}

export function InspectorPanelFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 border-t border-border px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}
