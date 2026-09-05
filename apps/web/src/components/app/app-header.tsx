"use client";

import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, DropdownMenu, Logo } from "@repo/ui/client";
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
      <div className="flex h-topbar items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-7">
          <Link
            href={homeHref}
            className="shrink-0 no-underline hover:[&_span:last-child]:text-accent-deep"
          >
            <Logo compact />
          </Link>
          <WorkspaceNav />
        </div>

        <div className="flex items-center gap-2.5">
          {title || subtitle ? (
            <div className="hidden text-right sm:block">
              {title ? (
                <p className="truncate text-sm font-medium text-text">{title}</p>
              ) : null}
              {subtitle ? (
                <p className="truncate text-xs text-text-3">{subtitle}</p>
              ) : null}
            </div>
          ) : null}
          <OrgWorkspaceSwitcher />
          <div className="h-[22px] w-px bg-border" />
          <DropdownMenu
            align="end"
            className="gap-2 rounded-sm px-1.5 py-1"
            items={[
              {
                label: "Sign out",
                icon: <LogOut strokeWidth={1.5} />,
                onSelect: signOut,
              },
            ]}
            trigger={
              <>
                <Avatar name={user.name} className="size-[26px] text-2xs" />
                <ChevronDown
                  className="size-3.25 text-text-3"
                  strokeWidth={1.5}
                />
                <span className="sr-only">Account menu</span>
              </>
            }
          />
        </div>
      </div>
    </header>
  );
}
