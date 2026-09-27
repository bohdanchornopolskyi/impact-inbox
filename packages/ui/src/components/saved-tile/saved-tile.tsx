"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { Ellipsis, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

export type SavedTileProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  summary: string;
  preview?: ReactNode;
  more?: ReactNode;
  onInsert?: () => void;
  onUpdate?: () => void;
  onMore?: () => void;
};

function SavedTileMore({
  more,
  onMore,
}: {
  more?: ReactNode;
  onMore?: () => void;
}) {
  if (more) {
    return more;
  }

  return (
    <button
      type="button"
      aria-label="More actions"
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-text-3 transition-colors duration-150 hover:bg-surface-sunken"
      onClick={onMore}
    >
      <Ellipsis className="size-4" strokeWidth={1.5} />
    </button>
  );
}

function SavedTilePreview({ preview }: { preview?: ReactNode }) {
  if (preview) {
    return <div className="overflow-hidden bg-surface-sunken">{preview}</div>;
  }

  return (
    <div className="flex h-[68px] flex-col justify-center gap-1.5 bg-surface-sunken px-3.5 py-2.5">
      <span className="h-2 w-full rounded-xs bg-border" />
      <span className="h-2 w-[120px] rounded-xs bg-border" />
    </div>
  );
}

export function SavedTile({
  name,
  summary,
  preview,
  more,
  onInsert,
  onUpdate,
  onMore,
  className,
  ...props
}: SavedTileProps) {
  const showActions = Boolean(onUpdate);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
      {...props}
    >
      {showActions ? (
        <SavedTilePreview preview={preview} />
      ) : (
        <button
          type="button"
          className="flex w-full flex-col text-left"
          disabled={!onInsert}
          onClick={onInsert}
        >
          <SavedTilePreview preview={preview} />
        </button>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5">
        {showActions ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">{name}</p>
            <p className="truncate text-2xs text-text-3">{summary}</p>
          </div>
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            disabled={!onInsert}
            onClick={onInsert}
          >
            <p className="truncate text-sm font-semibold text-text">{name}</p>
            <p className="truncate text-2xs text-text-3">{summary}</p>
          </button>
        )}
        <SavedTileMore more={more} onMore={onMore} />
      </div>
      {showActions ? (
        <div className="flex gap-2 px-3 pb-3">
          <Button
            variant="primary"
            size="sm"
            className="h-7 flex-1"
            leftIcon={<Plus strokeWidth={2} />}
            onClick={onInsert}
          >
            Insert
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 flex-1"
            leftIcon={<Plus strokeWidth={2} />}
            onClick={onUpdate}
          >
            Update
          </Button>
        </div>
      ) : null}
    </div>
  );
}
