import type { HTMLAttributes } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "onChange"> & {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
};

function pageItems(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 1) {
    return [1];
  }
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  let start = Math.max(2, page - 1);
  let end = Math.min(pageCount - 1, page + 1);
  if (page <= 2) {
    end = Math.min(pageCount - 1, 3);
  }
  if (page >= pageCount - 1) {
    start = Math.max(2, pageCount - 2);
  }

  const items: Array<number | "ellipsis"> = [1];
  if (start > 2) {
    items.push("ellipsis");
  }
  for (let n = start; n <= end; n += 1) {
    items.push(n);
  }
  if (end < pageCount - 1) {
    items.push("ellipsis");
  }
  items.push(pageCount);
  return items;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const current = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const total = Math.max(pageCount, 1);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={current <= 1}
        className={cn(
          "mr-1.5 inline-flex size-7 items-center justify-center rounded-sm border border-border bg-surface text-text-2 transition-colors duration-150 hover:bg-neutral-25 disabled:text-text-3 disabled:hover:bg-surface",
        )}
        onClick={() => onPageChange?.(current - 1)}
      >
        <ChevronLeft className="size-[13px]" strokeWidth={1.5} />
      </button>
      {pageItems(current, total).map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-7 w-[22px] items-center justify-center text-sm text-text-3"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === current ? "page" : undefined}
            className={cn(
              "inline-flex h-7 min-w-[30px] items-center justify-center rounded-sm px-2 text-sm transition-colors duration-150",
              item === current
                ? "bg-accent-soft font-semibold text-accent"
                : "font-medium text-text-2 hover:bg-neutral-25",
            )}
            onClick={() => onPageChange?.(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={current >= total}
        className="ml-1.5 inline-flex size-7 items-center justify-center rounded-sm border border-border bg-surface text-text-2 transition-colors duration-150 hover:bg-neutral-25 disabled:text-text-3 disabled:hover:bg-surface"
        onClick={() => onPageChange?.(current + 1)}
      >
        <ChevronRight className="size-[13px]" strokeWidth={1.5} />
      </button>
    </nav>
  );
}
