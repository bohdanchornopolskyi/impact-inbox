import type { HTMLAttributes, ReactNode } from "react";
import { Eye } from "lucide-react";
import { cn } from "../../lib/cn";

export type SettingsContentProps = HTMLAttributes<HTMLDivElement>;

export function SettingsContent({ className, ...props }: SettingsContentProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-200 flex-col gap-5 px-4 pt-8 pb-8 sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function SettingsPane({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-auto", className)}
      {...props}
    />
  );
}

export function SettingsFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center border-t border-border bg-surface px-8",
        className,
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-200">{children}</div>
    </div>
  );
}

export function SettingsPreview({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg bg-bg p-3 text-xs leading-snug text-text-2",
        className,
      )}
      {...props}
    >
      <Eye className="mt-px size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
      <p className="min-w-0">{children}</p>
    </div>
  );
}
