import type { ReactNode } from "react";
import { cn } from "@repo/ui";

export function WorkspacePageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-5xl px-4 py-8 sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WorkspacePageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-ui-2xl font-semibold tracking-snug text-text-primary">
          {title}
        </h1>
        {description ? (
          <div className="mt-1 text-ui-sm text-text-secondary">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
