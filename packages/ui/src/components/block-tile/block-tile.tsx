import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BlockTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
  grabbed?: boolean;
};

export function BlockTile({
  label,
  icon,
  grabbed = false,
  disabled,
  className,
  ...props
}: BlockTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      data-grabbed={grabbed || undefined}
      className={cn(
        "flex h-[38px] w-full items-center gap-2 rounded-sm border border-border bg-surface px-2.5 text-left transition-[background-color,border-color,box-shadow,opacity,transform] duration-150 ease-out",
        disabled
          ? "cursor-not-allowed bg-bg text-text-3"
          : "hover:border-border-strong hover:bg-bg",
        grabbed &&
          "border-accent bg-surface opacity-90 shadow-md rotate-[0.6deg] cursor-grabbing",
        !disabled && !grabbed && props.onPointerDown
          ? "touch-none cursor-grab active:cursor-grabbing"
          : null,
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex size-[15px] shrink-0 [&_svg]:size-full",
          disabled ? "text-neutral-400" : "text-text-2",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span
        className={cn(
          "truncate text-xs font-medium",
          disabled ? "text-text-3" : "text-text",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function paletteTileInteractionClass(
  disabled: boolean | undefined,
  draggable: boolean,
) {
  if (disabled) {
    return "cursor-not-allowed opacity-60";
  }
  return draggable ? "touch-none cursor-grab active:cursor-grabbing" : null;
}

export type SectionTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  preview: ReactNode;
};

export function SectionTile({
  label,
  preview,
  disabled,
  className,
  ...props
}: SectionTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "group/section flex w-full min-w-0 flex-col gap-1.5 text-left",
        paletteTileInteractionClass(disabled, Boolean(props.onPointerDown)),
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "flex h-[78px] w-full flex-col overflow-hidden rounded-sm border border-border bg-surface p-2 transition-[border-color,box-shadow] duration-150 ease-out",
          !disabled &&
            "group-hover/section:border-border-strong group-hover/section:shadow-sm",
        )}
        aria-hidden
      >
        {preview}
      </span>
      <span className="truncate text-xs font-medium text-text">{label}</span>
    </button>
  );
}

export type ColumnPresetTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  widths: readonly number[];
};

export function ColumnPresetTile({
  label,
  widths,
  disabled,
  className,
  ...props
}: ColumnPresetTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex w-full min-w-0 flex-col items-center gap-1.5 rounded-sm border border-border bg-surface px-2 pt-2 pb-1.75 transition-[background-color,border-color] duration-150 ease-out",
        !disabled && "hover:border-border-strong hover:bg-bg",
        paletteTileInteractionClass(disabled, Boolean(props.onPointerDown)),
        className,
      )}
      {...props}
    >
      <span className="flex h-4.5 w-full gap-0.75" aria-hidden>
        {widths.map((width, index) => (
          <span
            key={index}
            className="h-full min-w-0 rounded-[2px] bg-neutral-200"
            style={{ flexGrow: width, flexBasis: 0 }}
          />
        ))}
      </span>
      <span className="truncate text-[11.5px] font-medium text-text-2">
        {label}
      </span>
    </button>
  );
}
