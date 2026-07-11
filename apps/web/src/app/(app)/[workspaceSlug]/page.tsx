"use client";

import Link from "next/link";
import { TrialBanner } from "@/components/app/trial-banner";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatRoleLabel } from "@/lib/members/format-role-label";

const PLACEHOLDER_STATS = [
  { label: "Contacts", hrefSuffix: "/contacts" },
  { label: "Templates", hrefSuffix: "/templates" },
  { label: "Campaigns", hrefSuffix: "/campaigns" },
] as const;

export default function WorkspaceHomePage() {
  const { workspace } = useWorkspace();
  const { organizations } = useSession();
  const organization = organizations.find(
    (item) => item.id === workspace.organizationId,
  );
  const basePath = `/${workspace.slug}`;

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

      <div className="grid gap-4 sm:grid-cols-3">
        {PLACEHOLDER_STATS.map((stat) => (
          <Link
            key={stat.label}
            href={`${basePath}${stat.hrefSuffix}`}
            className="rounded-2xl border border-border-default bg-surface-card p-5 shadow-sm transition-colors hover:border-border-strong"
          >
            <p className="text-ui-xs font-medium tracking-[0.15em] text-text-tertiary uppercase">
              {stat.label}
            </p>
            <p className="mt-3 text-ui-2xl font-semibold tracking-tight text-text-muted">
              —
            </p>
            <p className="mt-1 text-ui-xs text-text-tertiary">Coming soon</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-dashed border-border-default bg-surface-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-ui-lg font-medium text-text-primary">
              Recent campaigns
            </h2>
            <p className="mt-2 text-ui-sm text-text-secondary">
              Campaign activity will show here once sending ships. Nothing to
              list yet.
            </p>
          </div>
          <Link
            href={`${basePath}/campaigns`}
            className="inline-flex shrink-0 text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
          >
            Open campaigns
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
          <h2 className="text-ui-lg font-medium text-text-primary">Templates</h2>
          <p className="mt-2 text-ui-sm text-text-secondary">
            Design email layouts, save revisions, and export HTML.
          </p>
          <Link
            href={`${basePath}/templates`}
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
