"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState, SettingsContent } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatRoleLabel } from "@/lib/members/format-role-label";
import { WorkspaceMembersSection } from "@/components/workspace/workspace-members-section";
import { WorkspaceBrandSection } from "@/components/workspace/workspace-brand-section";
import { WorkspaceModulesSection } from "@/components/workspace/workspace-modules-section";
import { WorkspaceGeneralPage } from "@/components/workspace/workspace-general-page";
import {
  isSettingsTab,
  settingsTabLabel,
  type SettingsTab,
} from "@/components/workspace/settings-nav-groups";
import { WorkspaceSettingsNav } from "@/components/workspace/workspace-settings-nav";

export function WorkspaceSettingsView() {
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: SettingsTab = isSettingsTab(tabParam) ? tabParam : "general";

  function setTab(next: SettingsTab) {
    if (next === tab) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (next === "general") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--spacing-topbar))]">
      <WorkspaceSettingsNav
        tab={tab}
        workspaceName={workspace.name}
        onSelect={setTab}
      />
      <p className="sr-only">Your role: {formatRoleLabel(workspace.role)}</p>
      <div className="min-w-0 flex-1">
        <SettingsContent>
          <SettingsSection
            tab={tab}
            canManage={canManage}
            workspaceId={workspace.id}
            organizationId={workspace.organizationId}
          />
        </SettingsContent>
      </div>
    </div>
  );
}

function SettingsSection({
  tab,
  canManage,
  workspaceId,
  organizationId,
}: {
  tab: SettingsTab;
  canManage: boolean;
  workspaceId: string;
  organizationId: string;
}) {
  if (tab === "general") {
    return <WorkspaceGeneralPage />;
  }

  if (tab === "brand") {
    return <WorkspaceBrandSection />;
  }

  if (tab === "modules") {
    return <WorkspaceModulesSection />;
  }

  if (tab === "members") {
    return (
      <WorkspaceMembersSection
        workspaceId={workspaceId}
        organizationId={organizationId}
        canManage={canManage}
      />
    );
  }

  return (
    <EmptyState
      title={settingsTabLabel(tab)}
      description="This section is not available yet."
    />
  );
}
