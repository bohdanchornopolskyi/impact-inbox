import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "soft"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-sm px-2.5 py-1.5 text-ui-sm",
  md: "gap-1.5 rounded-md px-3.5 py-1.5 text-ui-base",
  lg: "gap-2 rounded-md px-4 py-button-lg-y text-ui-md",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-accent bg-accent font-semibold text-text-on-accent shadow-accent hover:border-accent-hover hover:bg-accent-hover",
  secondary:
    "border border-border-strong bg-surface-card font-medium text-text-secondary hover:bg-surface-muted",
  ghost:
    "border border-transparent bg-transparent font-medium text-text-secondary hover:bg-surface-muted",
  soft: "border border-transparent bg-accent-soft font-medium text-accent-text hover:bg-accent-soft-hover",
  danger:
    "border border-status-danger-fg bg-status-danger-fg font-semibold text-white hover:brightness-95",
};

export function Button({
  children,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-[background,border-color,color,box-shadow] duration-120 disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

export function authShellLinkClass(className?: string) {
  return cn(
    "font-semibold text-accent-text transition-colors hover:text-accent-deep",
    className,
  );
}
