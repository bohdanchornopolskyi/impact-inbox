import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type AuthNoticeProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
};

export function AuthNotice({ icon, title, children, className }: AuthNoticeProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="mx-auto mb-4 inline-flex size-[52px] items-center justify-center rounded-full bg-accent-soft">
        {icon}
      </div>
      <h1 className="text-ui-xl font-semibold tracking-snug text-text-primary">
        {title}
      </h1>
      <div className="mt-2 text-ui-md leading-normal text-text-tertiary">
        {children}
      </div>
    </div>
  );
}

export function AuthNoticeEmail({ email }: { email: string }) {
  return (
    <span className="font-mono text-ui-sm text-text-secondary">{email}</span>
  );
}
