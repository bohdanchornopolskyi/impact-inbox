import type { HTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Avatar } from "../avatar/avatar";

export type AppBarProps = HTMLAttributes<HTMLElement>;

export function AppBar({ className, children, ...props }: AppBarProps) {
  return (
    <header className={cn("border-b border-border bg-surface", className)} {...props}>
      <div className="flex h-topbar items-center justify-between gap-4 px-5">
        {children}
      </div>
    </header>
  );
}

export function AppBarStart({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-7", className)}
      {...props}
    />
  );
}

export function AppBarNav({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center gap-1 overflow-x-auto", className)}
      {...props}
    />
  );
}

export function AppBarEnd({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props} />
  );
}

export function AppBarDivider({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("h-[22px] w-px bg-border", className)}
      aria-hidden
      {...props}
    />
  );
}

export function appBarUserClassName(className?: string) {
  return cn(
    "inline-flex items-center gap-2 rounded-sm px-1.5 py-1 text-text-2 transition-[background-color,color] duration-150 ease-out hover:bg-surface-sunken data-popup-open:bg-surface-sunken",
    className,
  );
}

export type AppBarUserProps = {
  name: string;
};

export function AppBarUser({ name }: AppBarUserProps) {
  return (
    <>
      <Avatar name={name} className="size-[26px] text-2xs" />
      <ChevronDown className="size-3.25 text-text-3" strokeWidth={1.5} />
      <span className="sr-only">Account menu</span>
    </>
  );
}
