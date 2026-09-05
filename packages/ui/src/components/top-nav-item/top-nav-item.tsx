import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type TopNavItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: ReactNode;
};

export function topNavItemClassName({
  active = false,
  className,
}: {
  active?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center rounded-sm px-3 py-[7px] text-sm leading-none whitespace-nowrap transition-[background-color,color] duration-150 ease-out",
    active
      ? "bg-accent-soft font-semibold text-accent"
      : "font-medium text-text-2 hover:bg-surface-sunken",
    className,
  );
}

export function TopNavItem({
  active = false,
  className,
  children,
  type = "button",
  ...props
}: TopNavItemProps) {
  return (
    <button
      type={type}
      aria-current={active ? "page" : undefined}
      className={topNavItemClassName({ active, className })}
      {...props}
    >
      {children}
    </button>
  );
}
