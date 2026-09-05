"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
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

function nextIndex(current: number, key: string, length: number) {
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

export function Tabs({ tabs, value, onChange, children, className }: TabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = `tab-panel-${value}`;

  function activate(index: number) {
    const tab = tabs[index];
    if (!tab) {
      return;
    }
    onChange(tab.value);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const mapped = nextIndex(index, event.key, tabs.length);
    if (mapped === index) {
      return;
    }
    event.preventDefault();
    activate(mapped);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex" role="tablist">
        {tabs.map((tab, index) => {
          const active = tab.value === value;
          const tabId = `tab-${tab.value}`;

          return (
            <button
              key={tab.value}
              id={tabId}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "border-b-2 px-1 pt-2.5 pb-3 text-sm transition-[color,border-color] duration-150 ease-out",
                active
                  ? "border-accent font-semibold text-text"
                  : "border-transparent font-medium text-text-3 hover:border-border-strong hover:text-text-2",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`tab-${value}`}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
