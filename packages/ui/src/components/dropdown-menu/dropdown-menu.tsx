"use client";

import type { ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn } from "../../lib/cn";

export type DropdownMenuItem = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  separatorBefore?: boolean;
  shortcut?: string;
};

export type DropdownMenuProps = {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "center" | "end";
  className?: string;
  "aria-label"?: string;
};

export function DropdownMenu({
  trigger,
  items,
  align = "end",
  className,
  "aria-label": ariaLabel,
}: DropdownMenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center justify-center rounded-sm p-1.5 text-text-2 transition-[background-color,color] duration-150 ease-out hover:bg-surface-sunken",
          className,
        )}
      >
        {trigger}
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner align={align} sideOffset={6}>
          <BaseMenu.Popup className="z-50 flex min-w-40 flex-col gap-0.5 rounded-md border border-border bg-surface p-1.5 shadow-md outline-none">
            {items.map((item) => (
              <div key={item.label} className="contents">
                {item.separatorBefore ? (
                  <hr className="h-px border-0 bg-border" />
                ) : null}
                <BaseMenu.Item
                  disabled={item.disabled}
                  onClick={item.onSelect}
                  className={cn(
                    "flex h-control-md w-full cursor-pointer items-center justify-between gap-3 rounded-xs px-2 text-left text-sm font-medium outline-none transition-[background-color,color] duration-150 ease-out",
                    item.destructive
                      ? "text-danger data-highlighted:bg-danger-50"
                      : "text-text data-highlighted:bg-surface-sunken",
                    "data-disabled:cursor-not-allowed data-disabled:text-text-3 data-disabled:data-highlighted:bg-transparent",
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2.25">
                    {item.icon ? (
                      <span
                        className={cn(
                          "inline-flex size-icon-sm shrink-0 [&_svg]:size-full",
                          item.disabled
                            ? "text-neutral-400"
                            : item.destructive
                              ? "text-danger"
                              : "text-text-3",
                        )}
                        aria-hidden
                      >
                        {item.icon}
                      </span>
                    ) : null}
                    {item.label}
                  </span>
                  {item.shortcut ? (
                    <span
                      className={cn(
                        "text-xs font-normal",
                        item.destructive ? "text-danger" : "text-text-3",
                      )}
                    >
                      {item.shortcut}
                    </span>
                  ) : null}
                </BaseMenu.Item>
              </div>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
