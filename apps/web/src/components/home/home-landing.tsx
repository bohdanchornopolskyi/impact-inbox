import Link from "next/link";
import { Logo } from "@repo/ui";

export function HomeLanding() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-page px-5 py-10">
      <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
        <Logo centered href="/" />
        <div className="space-y-3">
          <p className="text-ui-xs font-medium tracking-[0.2em] text-text-tertiary uppercase">
            Email templates for your team
          </p>
          <h1 className="text-ui-3xl font-semibold tracking-tight text-text-primary">
            Build and send on-brand email
          </h1>
          <p className="text-ui-md text-text-secondary">
            Sign in to manage workspace templates, or create an account to get
            started.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center justify-center rounded-md border border-accent bg-accent px-5 text-ui-base font-semibold text-text-on-accent shadow-accent transition-colors hover:border-accent-hover hover:bg-accent-hover"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border-strong bg-surface-card px-5 text-ui-base font-medium text-text-secondary transition-colors hover:bg-surface-muted"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
