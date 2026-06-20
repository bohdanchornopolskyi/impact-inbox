import { cn } from "./cn";

export function fieldControlClass({
  error,
  readOnly,
  className,
}: {
  error?: boolean;
  readOnly?: boolean;
  className?: string;
}) {
  return cn(
    "field-control flex items-center overflow-hidden rounded-md border border-border-strong bg-surface-card transition-[border-color,box-shadow] duration-120",
    "focus-within:border-accent focus-within:shadow-[var(--shadow-ring-accent)]",
    error &&
      "border-status-danger-fg focus-within:border-status-danger-fg focus-within:shadow-[var(--shadow-ring-danger)]",
    readOnly && "bg-surface-muted",
    className,
  );
}

export const fieldInputClass =
  "min-w-0 flex-1 border-none bg-transparent px-3 py-field-y text-ui-md text-text-primary outline-none placeholder:text-text-muted focus-visible:shadow-none";

export const fieldLabelClass = "text-ui-sm font-medium text-text-secondary";

export const fieldLabelRowClass = "mb-1.5 flex items-baseline justify-between gap-2";

export const fieldHintClass = "mt-1.5 text-ui-xs text-text-muted";

export const fieldErrorClass = "mt-1.5 text-ui-xs text-status-danger-fg";

export const fieldRootClass = "mb-4 block last:mb-0";
