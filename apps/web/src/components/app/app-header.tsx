"use client";

import Link from "next/link";
import {
  AppBar,
  AppBarDivider,
  AppBarEnd,
  AppBarStart,
  Logo,
} from "@repo/ui/client";
import { AccountMenu } from "@/components/app/account-menu";
import { OrgWorkspaceSwitcher } from "@/components/app/org-workspace-switcher";
import { WorkspaceNav } from "@/components/app/workspace-nav";
import { useSession } from "@/contexts/session-context";
import { useOptionalWorkspace } from "@/contexts/workspace-context";
import { resolveHomeHref } from "@/lib/app-navigation";

export function AppHeader() {
  const { workspaces } = useSession();
  const workspaceContext = useOptionalWorkspace();
  const homeHref = resolveHomeHref(
    workspaceContext?.workspace.slug,
    workspaces,
  );

  return (
    <AppBar>
      <AppBarStart>
        <Link
          href={homeHref}
          className="shrink-0 no-underline hover:[&_span:last-child]:text-accent-deep"
        >
          <Logo compact />
        </Link>
        <WorkspaceNav />
      </AppBarStart>

      <AppBarEnd>
        <OrgWorkspaceSwitcher />
        <AppBarDivider />
        <AccountMenu />
      </AppBarEnd>
    </AppBar>
  );
}
