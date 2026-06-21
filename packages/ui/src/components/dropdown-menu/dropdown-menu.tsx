"use client";

import type { ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn } from "../../lib/cn";

export type DropdownMenuItem = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export type DropdownMenuProps = {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "center" | "end";
  className?: string;
};

export function DropdownMenu({
  trigger,
  items,
  align = "end",
  className,
}: DropdownMenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-transparent p-1.5 text-text-secondary hover:bg-surface-muted",
          className,
        )}
      >
        {trigger}
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner align={align} sideOffset={6}>
          <BaseMenu.Popup className="z-50 min-w-40 rounded-xl border border-border-default bg-surface-card p-1 shadow-pop outline-none">
            {items.map((item) => (
              <BaseMenu.Item
                key={item.label}
                disabled={item.disabled}
                onClick={item.onSelect}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-ui-sm outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-surface-muted",
                  item.destructive
                    ? "text-status-danger-fg data-[highlighted]:bg-status-danger-bg"
                    : "text-text-secondary",
                )}
              >
                {item.label}
              </BaseMenu.Item>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
