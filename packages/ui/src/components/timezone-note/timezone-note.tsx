import type { HTMLAttributes, ReactNode } from "react";
import { Globe } from "lucide-react";
import { cn } from "../../lib/cn";

export type TimezoneNoteProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

export function TimezoneNote({ children, className, ...props }: TimezoneNoteProps) {
  return (
    <p
      className={cn("flex items-center gap-1.5 text-xs text-text-3", className)}
      {...props}
    >
      <Globe className="size-[13px] shrink-0" strokeWidth={1.5} aria-hidden />
      {children}
    </p>
  );
}
