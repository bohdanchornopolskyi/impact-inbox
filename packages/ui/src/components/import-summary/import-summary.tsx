import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { cn } from "../../lib/cn";

export type ImportSummaryProps = {
  title: string;
  children?: ReactNode;
  className?: string;
};

export function ImportSummary({ title, children, className }: ImportSummaryProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col gap-2 rounded-md bg-success-50 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex size-icon-md shrink-0 text-success-700 [&_svg]:size-full">
          <CircleCheck strokeWidth={1.5} aria-hidden />
        </span>
        <p className="text-sm font-semibold text-pretty text-success-700">{title}</p>
      </div>
      {children ? (
        <div className="text-sm text-pretty text-text-2">{children}</div>
      ) : null}
    </div>
  );
}
