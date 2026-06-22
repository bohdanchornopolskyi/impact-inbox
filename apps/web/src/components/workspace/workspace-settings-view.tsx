"use client";

import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatRoleLabel } from "@/lib/members/format-role-label";
import { WorkspaceMembersSection } from "@/components/workspace/workspace-members-section";

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

      <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
              Name
            </dt>
            <dd className="mt-1 text-ui-sm text-text-primary">{workspace.name}</dd>
          </div>
          <div>
            <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
              Slug
            </dt>
            <dd className="mt-1 font-mono text-ui-sm text-text-primary">
              {workspace.slug}
            </dd>
          </div>
        </dl>
      </section>

      <WorkspaceMembersSection
        workspaceId={workspace.id}
        organizationId={workspace.organizationId}
        canManage={canManage}
      />
    </div>
  );
}
