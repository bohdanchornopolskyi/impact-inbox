import { cn } from "../../lib/cn";

export function AuthShellDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "-mx-auth-card-x mt-[22px] border-t border-border-subtle",
        className,
      )}
    />
  );
}
