import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type CropToolButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function CropToolButton({
  className,
  children,
  ...props
}: CropToolButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-[26px] items-center justify-center rounded-xs text-white/80 transition-colors duration-150 hover:bg-white/10 [&_svg]:size-[13px]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
