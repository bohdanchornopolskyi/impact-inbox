"use client";

import type { ReactNode } from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cn } from "../../lib/cn";

export type CollapsibleSectionProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  return (
    <BaseCollapsible.Root
      defaultOpen={defaultOpen}
      className={cn("rounded-md border border-border-default bg-surface-card", className)}
    >
      <BaseCollapsible.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left text-ui-sm font-medium text-text-primary hover:bg-surface-muted">
        {title}
        <span className="text-text-muted">▾</span>
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className="border-t border-border-subtle px-4 py-3 text-ui-sm text-text-secondary">
        {children}
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}

export { BaseCollapsible as Collapsible };
