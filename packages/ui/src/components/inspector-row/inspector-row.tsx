import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export const inspectorControlClass =
  "w-full [&_button]:min-w-0 [&_button]:flex-1";

export type InspectorRowProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
};

export function InspectorRow({
  label,
  hint,
  htmlFor,
  children,
  className,
  ...props
}: InspectorRowProps) {
  return (
    <div className="flex flex-col gap-1" {...props}>
      <div className={cn("flex items-center gap-2.5", className)}>
        {htmlFor ? (
          <label htmlFor={htmlFor} className="w-[78px] shrink-0 text-xs text-text-2">
            {label}
          </label>
        ) : (
          <span className="w-[78px] shrink-0 text-xs text-text-2">{label}</span>
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {hint ? (
        <p className="pl-[88px] text-[11px] leading-snug text-text-3">{hint}</p>
      ) : null}
    </div>
  );
}

export type InspectorStackProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export function InspectorStack({
  label,
  htmlFor,
  children,
  className,
}: InspectorStackProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-xs text-text-2">
          {label}
        </label>
      ) : (
        <span className="text-xs text-text-2">{label}</span>
      )}
      {children}
    </div>
  );
}
