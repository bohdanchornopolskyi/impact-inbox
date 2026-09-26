import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type EditorBarProps = HTMLAttributes<HTMLDivElement>;

export function EditorBar({ className, ...props }: EditorBarProps) {
  return (
    <div
      className={cn(
        "grid h-topbar shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(max-content,1fr)] items-center gap-3 border-b border-border bg-surface px-4",
        className,
      )}
      {...props}
    />
  );
}

export function EditorBarStart({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-2.5", className)}
      {...props}
    />
  );
}

export function EditorBarCenter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props} />
  );
}

export function EditorBarEnd({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-w-0 items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

export function EditorBarDivider({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("h-5 w-px bg-border", className)} aria-hidden {...props} />
  );
}
