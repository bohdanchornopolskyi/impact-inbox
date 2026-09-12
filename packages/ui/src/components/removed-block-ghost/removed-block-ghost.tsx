import type { HTMLAttributes } from "react";
import { CircleMinus } from "lucide-react";
import { cn } from "../../lib/cn";

export type RemovedBlockGhostProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
};

export function RemovedBlockGhost({
  label,
  className,
  ...props
}: RemovedBlockGhostProps) {
  return (
    <div className={cn("px-5 py-2.5", className)} {...props}>
      <div className="flex h-[38px] items-center justify-center gap-1.75 rounded-sm border border-danger-200 bg-danger-50 px-3">
        <CircleMinus className="size-[13px] text-danger-700" strokeWidth={1.5} aria-hidden />
        <p className="text-xs font-medium text-danger-700">{label}</p>
      </div>
    </div>
  );
}
