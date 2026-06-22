"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  OrganizationDetailData,
  WorkspaceListItemData,
  WorkspaceRole,
} from "@repo/shared";
import { hasOrganizationRoleAtLeast } from "@repo/shared";
import { Button } from "@repo/ui/client";
import { CreateWorkspaceModal } from "@/components/org/create-workspace-modal";
import { OrgMembersSection } from "@/components/org/org-members-section";
import { formatDateTime } from "@/lib/format-date";
import { formatRoleLabel } from "@/lib/members/format-role-label";

type OrganizationSettingsViewProps = {
  organization: OrganizationDetailData;
  organizationWorkspaces: WorkspaceListItemData[];
};

export function OrganizationSettingsView({
  organization,
  organizationWorkspaces,
}: OrganizationSettingsViewProps) {
  const canManage = hasOrganizationRoleAtLeast(organization.role, [
    "owner",
    "org_admin",
  ]);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const defaultWorkspace = organizationWorkspaces[0];

  const workspaceLinks = useMemo(
    () =>
      [...organizationWorkspaces].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    [organizationWorkspaces],
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <p className="text-ui-xs font-medium tracking-[0.2em] text-text-tertiary uppercase">
          Organization
        </p>
        <h1 className="text-ui-3xl font-semibold tracking-tight text-text-primary">
          {organization.name}
        </h1>
        <p className="text-ui-sm text-text-secondary">
          Your role: {formatRoleLabel(organization.role)}
        </p>
      </div>

      <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
              Plan
            </dt>
            <dd className="mt-1 text-ui-sm text-text-primary">
              {organization.planTier ?? "Trial / unpaid"}
            </dd>
          </div>
          <div>
            <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
              Trial ends
            </dt>
            <dd className="mt-1 text-ui-sm text-text-primary">
              {formatDateTime(organization.trialEndsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
              Workspaces
            </dt>
            <dd className="mt-1 text-ui-sm text-text-primary">
              {organizationWorkspaces.length}
            </dd>
          </div>
          <div>
            <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
              Created
            </dt>
            <dd className="mt-1 text-ui-sm text-text-primary">
              {formatDateTime(organization.createdAt)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-ui-lg font-medium text-text-primary">Workspaces</h2>
            <p className="mt-1 text-ui-sm text-text-secondary">
              Workspaces in this organization.
            </p>
          </div>
          {canManage ? (
            <Button variant="primary" onClick={() => setCreateWorkspaceOpen(true)}>
              Create workspace
            </Button>
          ) : null}
        </div>

        {workspaceLinks.length === 0 ? (
          <p className="text-ui-sm text-text-secondary">No workspaces yet.</p>
        ) : (
          <ul className="divide-y divide-border-subtle rounded-xl border border-border-default">
            {workspaceLinks.map((workspace) => (
              <li key={workspace.id}>
                <Link
                  href={`/${workspace.slug}`}
                  className="flex items-center justify-between px-4 py-3 text-ui-sm hover:bg-surface-inset"
                >
                  <span className="font-medium text-text-primary">{workspace.name}</span>
                  <span className="text-text-tertiary">{workspace.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <OrgMembersSection orgId={organization.id} canManage={canManage} />

      {defaultWorkspace ? (
        <Link
          href={`/${defaultWorkspace.slug}`}
          className="inline-flex w-fit text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
        >
          Back to {defaultWorkspace.name}
        </Link>
      ) : null}

      <CreateWorkspaceModal
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
        organizationId={organization.id}
      />
    </div>
  );
}
