"use client";

import type { ReactNode } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "../../lib/cn";

export type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
  triggerClassName?: string;
};

export function Popover({
  trigger,
  children,
  align = "start",
  className,
  triggerClassName,
}: PopoverProps) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger
        className={cn(
          "inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-text-2 transition-[background-color,border-color] duration-150 ease-out hover:border-border-strong hover:bg-surface-sunken",
          triggerClassName,
        )}
      >
        {trigger}
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner align={align} sideOffset={6}>
          <BasePopover.Popup
            className={cn(
              "z-50 min-w-56 rounded-md border border-border bg-surface p-1.5 shadow-[0_8px_24px_#0f172a1f] outline-none",
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
