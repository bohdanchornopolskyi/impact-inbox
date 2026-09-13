import { cn } from "./cn";

export function fieldControlClass({
  error,
  readOnly,
  disabled,
  multiline,
  className,
}: {
  error?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  className?: string;
}) {
  return cn(
    "field-control rounded-sm border border-border-strong bg-surface transition-[border-color,box-shadow] duration-150 ease-out",
    multiline ? "overflow-visible" : "flex items-center overflow-hidden",
    "hover:border-neutral-400",
    "focus-within:border-accent focus-within:shadow-[var(--shadow-ring-accent)]",
    error &&
      "border-danger hover:border-danger focus-within:border-danger focus-within:shadow-[var(--shadow-ring-danger)]",
    readOnly && "bg-surface-sunken hover:border-border-strong",
    disabled &&
      "border-neutral-200 bg-neutral-100 text-text-3 hover:border-neutral-200",
    className,
  );
}

export const hideNumberSpinnersClass =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export const fieldInputClass =
  "h-control-md min-w-0 flex-1 border-none bg-transparent px-3 text-sm leading-none text-text outline-none placeholder:text-text-3 focus-visible:shadow-none disabled:cursor-not-allowed disabled:text-text-3";

export const fieldLabelClass = "text-sm font-medium text-text-2";

export const fieldLabelRowClass =
  "mb-1.5 flex items-baseline justify-between gap-2";

export const fieldHintClass = "mt-1.5 text-xs text-text-3";

export const fieldErrorClass = "mt-1.5 text-xs text-danger";

export const fieldRootClass = "mb-4 block last:mb-0";
