import type { ReactNode } from "react";
import { Logo } from "../logo/logo";

export type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  logoHref?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  logoHref,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-page px-5 py-10">
      <div className="w-full max-w-auth-shell">
        <Logo centered href={logoHref} />
        <div className="rounded-2xl border border-border-default bg-surface-card px-auth-card-x pt-auth-card-pt pb-auth-card-pb shadow-sm">
          <div className="mb-auth-heading">
            <h1 className="text-ui-xl font-semibold tracking-snug text-text-primary">
              {title}
            </h1>
            <p className="mt-1.5 text-ui-md leading-normal text-text-tertiary">
              {description}
            </p>
          </div>
          {children}
        </div>
        {footer ? (
          <div className="mt-auth-footer text-center text-ui-md text-text-tertiary">
            {footer}
          </div>
        ) : null}
        <p className="mt-auth-copyright text-center text-ui-xs text-text-muted">
          © 2026 Impact Inbox
        </p>
      </div>
    </div>
  );
}
