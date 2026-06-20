import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  children: ReactNode;
};

export function Card({
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-surface-card p-5 transition-[box-shadow,border-color] duration-180",
        interactive &&
          "cursor-pointer hover:border-border-strong hover:shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
