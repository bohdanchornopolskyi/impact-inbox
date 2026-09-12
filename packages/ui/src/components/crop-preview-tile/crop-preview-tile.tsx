import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type CropPreviewTileProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  src?: string;
  preview?: ReactNode;
};

export function CropPreviewTile({
  label,
  src,
  preview,
  className,
  ...props
}: CropPreviewTileProps) {
  return (
    <div className={cn("flex w-20 flex-col items-center gap-1.5", className)} {...props}>
      <div className="h-[52px] w-full overflow-hidden rounded-sm border border-black/12">
        {preview ??
          (src ? (
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-surface-sunken" />
          ))}
      </div>
      <p className="text-[10.5px] font-medium text-text-3">{label}</p>
    </div>
  );
}
