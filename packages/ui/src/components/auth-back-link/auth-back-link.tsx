import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M15 10 H5 M9 6 L5 10 L9 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function authBackLinkClass(className?: string) {
  return cn(
    "inline-flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-text-3 no-underline transition-colors duration-150 hover:text-text-2 active:text-text",
    className,
  );
}

export type AuthBackLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};

export function AuthBackLink({
  children = "Back to sign in",
  className,
  ...props
}: AuthBackLinkProps) {
  return (
    <a className={authBackLinkClass(className)} {...props}>
      <ArrowLeftIcon />
      {children}
    </a>
  );
}
