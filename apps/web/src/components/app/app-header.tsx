"use client";

import Link from "next/link";
import { Button } from "@repo/ui/client";
import { OrgWorkspaceSwitcher } from "@/components/app/org-workspace-switcher";
import { WorkspaceNav } from "@/components/app/workspace-nav";
import { useSession } from "@/contexts/session-context";
import { useOptionalWorkspace } from "@/contexts/workspace-context";
import { resolveAuthenticatedDestination } from "@/lib/auth-session";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user, signOut, workspaces } = useSession();
  const workspaceContext = useOptionalWorkspace();
  const defaultDestination = resolveAuthenticatedDestination(workspaces);
  const homeHref =
    workspaceContext?.workspace.slug
      ? `/${workspaceContext.workspace.slug}`
      : defaultDestination.kind === "workspace"
        ? defaultDestination.path
        : "/";

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex h-topbar items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-7">
          <Link
            href={homeHref}
            className="shrink-0 text-sm font-semibold text-text transition-colors duration-150 hover:text-accent active:text-brand-700"
          >
            Impact Inbox
          </Link>
          <WorkspaceNav />
        </div>

        <div className="flex items-center gap-4">
          <OrgWorkspaceSwitcher />
          <div className="hidden text-right sm:block">
            {title ? (
              <p className="truncate text-sm font-medium text-text">
                {title}
              </p>
            ) : null}
            {subtitle ? (
              <p className="truncate text-xs text-text-3">{subtitle}</p>
            ) : (
              <p className="truncate text-xs text-text-3">{user.email}</p>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
