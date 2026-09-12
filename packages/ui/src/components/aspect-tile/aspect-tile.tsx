import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type AspectTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  width: number;
  height: number;
  selected?: boolean;
};

export function AspectTile({
  label,
  width,
  height,
  selected = false,
  className,
  ...props
}: AspectTileProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-[62px] w-[88px] flex-col items-center justify-center gap-1.75 rounded-md border bg-surface px-2 py-2.5 transition-[border-color,background-color] duration-150",
        selected
          ? "border-accent bg-accent-soft"
          : "border-border hover:border-border-strong",
        className,
      )}
      {...props}
    >
      <span className="flex size-7 items-center justify-center" aria-hidden>
        <span
          className="rounded-[2px] border-[1.5px] border-text-3"
          style={{ width: width * 1.5, height: height * 1.5 }}
        />
      </span>
      <span
        className={cn(
          "text-[11.5px] font-medium",
          selected ? "text-accent" : "text-text-2",
        )}
      >
        {label}
      </span>
    </button>
  );
}
