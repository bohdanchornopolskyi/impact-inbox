"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type TabItem = {
  value: string;
  label: string;
};

export type TabsProps = {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

export function Tabs({ tabs, value, onChange, children, className }: TabsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className="flex gap-1 border-b border-border-default"
        role="tablist"
      >
        {tabs.map((tab) => {
          const active = tab.value === value;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.value)}
              className={cn(
                "border-b-2 px-3 py-2 text-ui-sm font-medium transition-colors duration-180",
                active
                  ? "border-accent text-accent-text"
                  : "border-transparent text-text-tertiary hover:text-text-secondary",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{children}</div>
    </div>
  );
}
