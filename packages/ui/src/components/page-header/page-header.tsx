import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type PageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-3xl font-bold text-balance text-text">{title}</h1>
        {description ? (
          <div className="text-sm text-pretty text-text-2">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
