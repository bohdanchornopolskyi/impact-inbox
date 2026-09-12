import type { HTMLAttributes } from "react";
import { Minus, Pencil, Plus } from "lucide-react";
import { cn } from "../../lib/cn";

export type ChangeMarkerTone = "added" | "edited" | "removed";

export type ChangeMarkerProps = HTMLAttributes<HTMLDivElement> & {
  tone: ChangeMarkerTone;
  label: string;
};

const toneClasses: Record<ChangeMarkerTone, string> = {
  added: "border-success bg-success-50 text-success-700",
  edited: "border-warning bg-warning-50 text-warning-700",
  removed: "border-danger bg-danger-50 text-danger-700",
};

const barClasses: Record<ChangeMarkerTone, string> = {
  added: "bg-success",
  edited: "bg-warning",
  removed: "bg-danger",
};

const toneIcon = {
  added: Plus,
  edited: Pencil,
  removed: Minus,
};

export function ChangeMarker({
  tone,
  label,
  className,
  ...props
}: ChangeMarkerProps) {
  const Icon = toneIcon[tone];

  return (
    <div className={cn("flex items-stretch gap-2", className)} {...props}>
      <span
        className={cn(
          "inline-flex h-5 items-center gap-1 self-start rounded-full border px-2 text-[10.5px] font-semibold",
          toneClasses[tone],
        )}
      >
        <Icon className="size-[11px]" strokeWidth={2} aria-hidden />
        {label}
      </span>
      <span className={cn("w-0.75 self-stretch rounded-full", barClasses[tone])} aria-hidden />
    </div>
  );
}
