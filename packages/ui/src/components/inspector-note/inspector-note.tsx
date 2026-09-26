import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "../../lib/cn";

export type InspectorNoteProps = {
  children: ReactNode;
  className?: string;
};

export function InspectorNote({ children, className }: InspectorNoteProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-sm bg-warning-50 px-2.5 py-2 text-[11.5px] leading-snug text-warning-700",
        className,
      )}
    >
      <TriangleAlert className="mt-px size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
      <p>{children}</p>
    </div>
  );
}
