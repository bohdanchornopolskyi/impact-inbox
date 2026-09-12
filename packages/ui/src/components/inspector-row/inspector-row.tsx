import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type InspectorRowProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  children: ReactNode;
};

export function InspectorRow({
  label,
  children,
  className,
  ...props
}: InspectorRowProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      <span className="w-[78px] shrink-0 text-xs text-text-2">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
