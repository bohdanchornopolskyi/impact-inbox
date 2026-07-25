"use client";

import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatRoleLabel } from "@/lib/members/format-role-label";
import { WorkspaceMembersSection } from "@/components/workspace/workspace-members-section";
import { WorkspaceGeneralSection } from "@/components/workspace/workspace-general-section";
import { WorkspaceIdentitySection } from "@/components/workspace/workspace-identity-section";
import { WorkspaceBrandSection } from "@/components/workspace/workspace-brand-section";

export function WorkspaceSettingsView() {
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <p className="text-ui-xs font-medium tracking-[0.2em] text-text-tertiary uppercase">
          Workspace
        </p>
        <h1 className="text-ui-3xl font-semibold tracking-tight text-text-primary">
          Settings
        </h1>
        <p className="text-ui-sm text-text-secondary">
          {workspace.name} · your role: {formatRoleLabel(workspace.role)}
        </p>
      </div>

      <WorkspaceIdentitySection />

      <WorkspaceBrandSection />

      <WorkspaceGeneralSection />

      <WorkspaceMembersSection
        workspaceId={workspace.id}
        organizationId={workspace.organizationId}
        canManage={canManage}
      />
    </div>
  );
}
