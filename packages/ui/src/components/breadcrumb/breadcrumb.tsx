import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BreadcrumbProps = HTMLAttributes<HTMLElement>;

export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className} {...props}>
      <ol className="flex items-center gap-1">{children}</ol>
    </nav>
  );
}

export type BreadcrumbItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  current?: boolean;
};

export function BreadcrumbItem({
  icon,
  current = false,
  className,
  children,
  ...props
}: BreadcrumbItemProps) {
  return (
    <li>
      <button
        type="button"
        aria-current={current ? "true" : undefined}
        className={cn(
          "inline-flex items-center gap-1.25 rounded-xs px-[7px] py-1 text-xs leading-none transition-[background-color,color] duration-150 ease-out",
          current
            ? "bg-accent-soft font-semibold text-accent"
            : "font-medium text-text-2 hover:bg-surface-sunken",
          className,
        )}
        {...props}
      >
        {icon ? (
          <span
            className={cn(
              "inline-flex size-3 shrink-0 [&_svg]:size-full",
              current ? "text-accent" : "text-text-3",
            )}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    </li>
  );
}
