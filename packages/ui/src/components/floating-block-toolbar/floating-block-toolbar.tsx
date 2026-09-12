"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";

export type FloatingBlockToolbarProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  icon?: ReactNode;
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
        "inline-flex size-6 items-center justify-center rounded-xs text-white/80 transition-colors duration-150 hover:bg-white/10",
        danger && "text-danger-200 hover:bg-white/10",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function FloatingBlockToolbar({
  label,
  icon,
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
        "inline-flex h-8 items-center gap-0.5 rounded-md bg-text px-1.25 text-text-inverse",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1.25 px-1 pr-1.75 text-xs font-semibold">
        {icon ? (
          <span className="inline-flex size-[13px] [&_svg]:size-full" aria-hidden>
            {icon}
          </span>
        ) : null}
        {label}
        <span className="ml-1 h-4 w-px bg-white/18" aria-hidden />
      </span>
      <span className="inline-flex size-6 items-center justify-center text-white/80" aria-hidden>
        <GripVertical className="size-[13px]" strokeWidth={1.5} />
      </span>
      <ToolButton label="Move up" onClick={onMoveUp}>
        <ArrowUp className="size-[13px]" strokeWidth={1.5} />
      </ToolButton>
      <ToolButton label="Move down" onClick={onMoveDown}>
        <ArrowDown className="size-[13px]" strokeWidth={1.5} />
      </ToolButton>
      <ToolButton label="Duplicate" onClick={onDuplicate}>
        <Copy className="size-[13px]" strokeWidth={1.5} />
      </ToolButton>
      <ToolButton label="Delete" danger onClick={onDelete}>
        <Trash2 className="size-[13px]" strokeWidth={1.5} />
      </ToolButton>
    </div>
  );
}
