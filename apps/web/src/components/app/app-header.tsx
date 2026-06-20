"use client";

import Link from "next/link";
import { Button } from "@repo/ui/client";
import { OrgWorkspaceSwitcher } from "@/components/app/org-workspace-switcher";
import { useSession } from "@/contexts/session-context";
import { useOptionalWorkspace } from "@/contexts/workspace-context";
import { resolveDefaultAppPath } from "@/lib/app-navigation";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user, signOut, workspaces } = useSession();
  const workspaceContext = useOptionalWorkspace();
  const homeHref =
    workspaceContext?.workspace.slug
      ? `/${workspaceContext.workspace.slug}`
      : (resolveDefaultAppPath(workspaces) ?? "/");

  return (
    <header className="border-b border-border-default bg-surface-card">
      <div className="flex h-topbar items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={homeHref}
            className="shrink-0 text-ui-sm font-semibold text-text-primary"
          >
            Impact Inbox
          </Link>
          <OrgWorkspaceSwitcher />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            {title ? (
              <p className="truncate text-ui-sm font-medium text-text-primary">
                {title}
              </p>
            ) : null}
            {subtitle ? (
              <p className="truncate text-ui-xs text-text-muted">{subtitle}</p>
            ) : (
              <p className="truncate text-ui-xs text-text-muted">{user.email}</p>
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
