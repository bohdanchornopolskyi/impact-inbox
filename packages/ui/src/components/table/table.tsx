import type {
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  HTMLAttributes,
} from "react";
import { cn } from "../../lib/cn";

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("bg-neutral-50 text-2xs font-semibold text-text-3", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-b-0", className)} {...props} />
  );
}

export function TableFooter({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn("border-t border-border bg-neutral-50 text-xs text-text-3", className)}
      {...props}
    />
  );
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean;
  interactive?: boolean;
};

export function TableRow({
  selected,
  interactive = true,
  className,
  ...props
}: TableRowProps) {
  return (
    <tr
      data-selected={selected || undefined}
      className={cn(
        "h-13 border-b border-border",
        interactive &&
          "group transition-[background-color] duration-150 ease-out hover:bg-neutral-50 data-selected:bg-accent-soft data-selected:shadow-[inset_0_0_0_1px_var(--color-brand-200)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("h-10 px-4 text-left align-middle font-semibold", className)} {...props} />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 align-middle text-text-2", className)} {...props} />
  );
}

export const tableActionClassName =
  "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-data-selected:opacity-100";
