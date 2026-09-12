import type { HTMLAttributes, ReactNode } from "react";
import { Ellipsis } from "lucide-react";
import { cn } from "../../lib/cn";
import { Avatar } from "../avatar/avatar";
import { Checkbox } from "../checkbox/checkbox";

export type ContactListItemProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  name: string;
  email: string;
  selected?: boolean;
  unsubscribed?: boolean;
  tags?: ReactNode;
  status?: ReactNode;
  added?: ReactNode;
  more?: ReactNode;
  onSelect?: (selected: boolean) => void;
  onMore?: () => void;
};

export function ContactListItem({
  name,
  email,
  selected = false,
  unsubscribed = false,
  tags,
  status,
  added,
  more,
  onSelect,
  onMore,
  className,
  ...props
}: ContactListItemProps) {
  return (
    <div
      data-selected={selected || undefined}
      className={cn(
        "flex h-[68px] items-center gap-3 border-b border-border bg-surface px-4 transition-[background-color] duration-150 ease-out hover:bg-neutral-25 data-[selected]:bg-accent-soft data-[selected]:hover:bg-accent-soft",
        className,
      )}
      {...props}
    >
      <Checkbox
        aria-label={`Select ${name}`}
        checked={selected}
        onChange={(event) => onSelect?.(event.target.checked)}
        onClick={(event) => event.stopPropagation()}
      />
      <Avatar name={name} className={unsubscribed ? "bg-surface-sunken" : undefined} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-sm font-medium",
            unsubscribed ? "text-text-2" : "text-text",
          )}
        >
          {name}
        </span>
        <span
          className={cn(
            "truncate text-xs",
            unsubscribed ? "text-neutral-400" : "text-text-3",
          )}
        >
          {email}
        </span>
      </div>
      {tags ? (
        <div className="flex w-[210px] shrink-0 items-center gap-1.5">{tags}</div>
      ) : null}
      {status ? (
        <div className="flex w-[130px] shrink-0 items-center">{status}</div>
      ) : null}
      {added ? (
        <div
          className={cn(
            "w-[110px] shrink-0 text-sm",
            unsubscribed ? "text-text-3" : "text-text-2",
          )}
        >
          {added}
        </div>
      ) : null}
      {more ?? (
        <button
          type="button"
          aria-label={`Actions for ${name}`}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-xs text-text-3 transition-colors duration-150 hover:bg-surface-sunken"
          onClick={(event) => {
            event.stopPropagation();
            onMore?.();
          }}
        >
          <Ellipsis className="size-icon-sm" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
