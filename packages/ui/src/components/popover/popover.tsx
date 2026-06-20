"use client";

import type { ReactNode } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "../../lib/cn";

export type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
};

export function Popover({
  trigger,
  children,
  align = "start",
  className,
}: PopoverProps) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface-card px-3 py-1.5 text-ui-sm text-text-secondary hover:bg-surface-muted",
        )}
      >
        {trigger}
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner align={align} sideOffset={8}>
          <BasePopover.Popup
            className={cn(
              "z-50 min-w-56 rounded-xl border border-border-default bg-surface-card p-2 shadow-pop outline-none",
              className,
            )}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

export { BasePopover };
