"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/cn";
import type { DropdownMenuItem } from "../dropdown-menu/dropdown-menu";

export type SplitButtonItem = DropdownMenuItem;

export type SplitButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: ReactNode;
  items: SplitButtonItem[];
  menuAlign?: "start" | "center" | "end";
  defaultOpen?: boolean;
};

export function SplitButton({
  children,
  items,
  menuAlign = "end",
  defaultOpen,
  className,
  disabled,
  onClick,
  type = "button",
  ...props
}: SplitButtonProps) {
  return (
    <BaseMenu.Root defaultOpen={defaultOpen}>
      <div
        className={cn(
          "inline-flex h-control-md items-center rounded-sm bg-accent text-text-inverse transition-[background-color] duration-150 ease-out hover:bg-accent-hover has-[[data-popup-open]]:bg-accent-hover",
          disabled && "pointer-events-none bg-neutral-200 text-text-3 hover:bg-neutral-200",
          className,
        )}
      >
        <button
          {...props}
          type={type}
          disabled={disabled}
          onClick={onClick}
          className="h-full pl-3.5 pr-2 text-sm font-semibold leading-none"
        >
          {children}
        </button>
        <span className="h-4 w-px bg-white/24" aria-hidden />
        <BaseMenu.Trigger
          disabled={disabled}
          aria-label="More options"
          className="group inline-flex h-full items-center px-2 pr-3.5 text-white/80"
        >
          <span className="relative inline-flex size-icon-sm" aria-hidden>
            <ChevronDown
              strokeWidth={2}
              className="size-full group-data-[popup-open]:invisible"
            />
            <ChevronUp
              strokeWidth={2}
              className="invisible absolute inset-0 size-full group-data-[popup-open]:visible"
            />
          </span>
        </BaseMenu.Trigger>
      </div>
      <BaseMenu.Portal>
        <BaseMenu.Positioner align={menuAlign} sideOffset={6}>
          <BaseMenu.Popup className="z-50 flex min-w-60 flex-col gap-0.5 rounded-md border border-border bg-surface p-1.5 shadow-md outline-none">
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
