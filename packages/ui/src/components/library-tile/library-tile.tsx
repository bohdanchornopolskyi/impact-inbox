import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export type LibraryTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  filename: string;
  meta: string;
  src?: string;
  current?: boolean;
  preview?: ReactNode;
};

export function LibraryTile({
  filename,
  meta,
  src,
  current = false,
  preview,
  className,
  ...props
}: LibraryTileProps) {
  return (
    <button
      type="button"
      className={cn("flex w-full flex-col gap-1.5 text-left", className)}
      {...props}
    >
      <span className="relative flex h-[118px] w-full items-start justify-start overflow-hidden rounded-sm border border-black/10 bg-surface-sunken p-2">
        {preview ??
          (src ? (
            <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
          ) : null)}
        {current ? (
          <span className="relative inline-flex size-[22px] items-center justify-center rounded-full bg-accent text-text-inverse">
            <Check className="size-3" strokeWidth={2.5} aria-hidden />
          </span>
        ) : null}
      </span>
      <span className="truncate text-xs font-medium text-text">{filename}</span>
      <span className="truncate text-2xs text-text-3">{meta}</span>
    </button>
  );
}
