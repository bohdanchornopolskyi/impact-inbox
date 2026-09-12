import type { ReactNode } from "react";
import { cn } from "@repo/ui";

export function WorkspacePageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-5xl px-4 py-8 sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
