"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";

export type FloatingBlockToolbarProps = HTMLAttributes<HTMLDivElement> & {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
};

function ToolButton({
  label,
  danger = false,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-xs text-white/80 transition-colors duration-150 hover:bg-white/10",
        danger && "text-[#FCA5A5] hover:bg-white/10",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function FloatingBlockToolbar({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  className,
  ...props
}: FloatingBlockToolbarProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-0.5 rounded-md bg-neutral-900 p-1 text-text-inverse",
        className,
      )}
      {...props}
    >
      <span className="inline-flex size-7 items-center justify-center text-white/80" aria-hidden>
        <GripVertical className="size-[15px]" strokeWidth={1.5} />
      </span>
      <ToolButton label="Move up" onClick={onMoveUp}>
        <ArrowUp className="size-[15px]" strokeWidth={1.5} />
      </ToolButton>
      <ToolButton label="Move down" onClick={onMoveDown}>
        <ArrowDown className="size-[15px]" strokeWidth={1.5} />
      </ToolButton>
      <ToolButton label="Duplicate" onClick={onDuplicate}>
        <Copy className="size-[15px]" strokeWidth={1.5} />
      </ToolButton>
      <ToolButton label="Delete" danger onClick={onDelete}>
        <Trash2 className="size-[15px]" strokeWidth={1.5} />
      </ToolButton>
    </div>
  );
}
