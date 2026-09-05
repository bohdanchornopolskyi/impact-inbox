import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type SidebarItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
};

export function sidebarItemClassName({
  active = false,
  className,
}: {
  active?: boolean;
  className?: string;
} = {}) {
  return cn(
    "flex h-control-md w-full items-center gap-[9px] rounded-sm px-2 text-left text-sm leading-none transition-[background-color,color] duration-150 ease-out",
    active
      ? "bg-accent-soft font-semibold text-accent"
      : "font-medium text-text-2 hover:bg-surface-sunken active:bg-neutral-200",
    className,
  );
}

export function SidebarItem({
  active = false,
  icon,
  className,
  children,
  type = "button",
  ...props
}: SidebarItemProps) {
  return (
    <button
      type={type}
      aria-current={active ? "page" : undefined}
      className={sidebarItemClassName({ active, className })}
      {...props}
    >
      {icon ? (
        <span
          className={cn(
            "inline-flex size-3.75 shrink-0 items-center justify-center [&_svg]:size-full",
            active ? "text-accent" : "text-text-3",
          )}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
