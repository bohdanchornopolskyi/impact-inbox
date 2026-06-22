"use client";

import Link from "next/link";
import { TrialBanner } from "@/components/app/trial-banner";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatRoleLabel } from "@/lib/members/format-role-label";

export default function WorkspaceHomePage() {
  const { workspace } = useWorkspace();
  const { organizations } = useSession();
  const organization = organizations.find(
    (item) => item.id === workspace.organizationId,
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      {organization ? <TrialBanner organization={organization} /> : null}

      <div className="space-y-2">
        <p className="text-ui-xs font-medium tracking-[0.2em] text-text-tertiary uppercase">
          Workspace
        </p>
        <h1 className="text-ui-3xl font-semibold tracking-tight text-text-primary">
          {workspace.name}
        </h1>
        <p className="text-ui-sm text-text-secondary">
          Signed in as {formatRoleLabel(workspace.role)}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
          <h2 className="text-ui-lg font-medium text-text-primary">Templates</h2>
          <p className="mt-2 text-ui-sm text-text-secondary">
            Design email layouts, save revisions, and export HTML.
          </p>
          <Link
            href={`/${workspace.slug}/templates`}
            className="mt-4 inline-flex text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
          >
            Open templates
          </Link>
        </section>

        <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
          <h2 className="text-ui-lg font-medium text-text-primary">Organization</h2>
          <p className="mt-2 text-ui-sm text-text-secondary">
            Billing, trial, members, and workspaces live at the organization level.
          </p>
          <Link
            href={`/org/${workspace.organizationId}/settings`}
            className="mt-4 inline-flex text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
          >
            Organization settings
          </Link>
        </section>
      </div>
    </div>
  );
}
