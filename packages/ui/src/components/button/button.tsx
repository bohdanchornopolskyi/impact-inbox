import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "soft"
  | "danger"
  | "link";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: boolean;
  selected?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  static?: boolean;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-control-sm gap-1.5 px-2.5 text-sm leading-none",
  md: "h-control-md gap-[7px] px-3.5 text-sm leading-none",
  lg: "h-control-lg gap-2 px-5 text-md leading-none",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "size-control-sm",
  md: "size-control-md",
  lg: "size-control-lg",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-accent text-text-inverse hover:bg-accent-hover active:bg-brand-700 disabled:bg-neutral-200 disabled:text-text-3 disabled:hover:bg-neutral-200",
  secondary:
    "border-border-strong bg-surface text-text-2 hover:bg-bg active:border-neutral-400 active:bg-surface-sunken disabled:border-neutral-200 disabled:text-text-3 disabled:hover:bg-surface",
  ghost:
    "border-transparent bg-transparent text-text-2 hover:bg-surface-sunken active:bg-neutral-200 disabled:text-text-3 disabled:hover:bg-transparent",
  soft: "border-transparent bg-accent-soft text-accent hover:bg-accent-soft-hover active:bg-brand-100 disabled:bg-neutral-100 disabled:text-text-3",
  danger:
    "border-danger-200 bg-surface text-danger hover:bg-danger-50 active:bg-danger-50 disabled:border-neutral-200 disabled:text-text-3 disabled:hover:bg-surface",
  link: "border-transparent bg-transparent px-0 text-accent hover:text-accent-hover active:text-brand-700 disabled:text-text-3",
};

function Spinner() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="size-full motion-safe:animate-spin"
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="22 12"
      />
    </svg>
  );
}

function ButtonIcon({
  children,
  size,
  className,
}: {
  children: ReactNode;
  size: ButtonSize;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center [&_svg]:size-full [&_svg]:stroke-[2]",
        size === "lg" ? "size-icon-md" : "size-icon-sm",
        className,
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  icon = false,
  selected = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  type = "button",
  disabled,
  static: noPressScale = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const leading = loading ? <Spinner /> : leftIcon;
  const isLink = variant === "link";
  const iconTone = cn(
    variant === "ghost" && !icon && !selected && "text-text-3",
    variant === "primary" && !isDisabled && "text-white/80",
  );

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,scale] duration-150 ease-out disabled:pointer-events-none disabled:cursor-not-allowed",
        isLink ? "h-auto gap-1.5 border-0 px-0" : icon ? iconSizeClasses[size] : sizeClasses[size],
        !isLink && "border",
        icon && "p-0",
        variantClasses[variant],
        selected && "bg-accent-soft text-accent hover:bg-accent-soft",
        fullWidth && !icon && !isLink && "w-full",
        !noPressScale && !isLink && "motion-safe:active:scale-[0.96]",
        className,
      )}
      {...props}
    >
      {icon ? (
        <ButtonIcon size={size} className={iconTone}>
          {leading ?? children}
        </ButtonIcon>
      ) : (
        <>
          {leading ? (
            <ButtonIcon size={size} className={iconTone}>
              {leading}
            </ButtonIcon>
          ) : null}
          {children}
          {rightIcon ? <ButtonIcon size={size}>{rightIcon}</ButtonIcon> : null}
        </>
      )}
    </button>
  );
}

export function authShellLinkClass(className?: string) {
  return cn(
    "text-sm font-semibold text-accent transition-colors duration-150 hover:text-accent-hover",
    className,
  );
}

export function authInlineLinkClass(className?: string) {
  return cn(
    "text-sm font-semibold text-accent no-underline transition-colors duration-150 hover:text-accent-hover",
    className,
  );
}
