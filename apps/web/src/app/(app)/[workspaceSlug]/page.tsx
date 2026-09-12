"use client";

import Link from "next/link";
import { Card, CardBody, CardDescription, CardHeader, CardTitle, PageHeader } from "@repo/ui/client";
import { TrialBanner } from "@/components/app/trial-banner";
import { WorkspacePageShell } from "@/components/app/workspace-page-chrome";
import { WorkspaceOverviewMetrics } from "@/components/workspace/workspace-overview-metrics";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatRoleLabel } from "@/lib/members/format-role-label";

export default function WorkspaceHomePage() {
  const { workspace } = useWorkspace();
  const { organizations } = useSession();
  const organization = organizations.find(
    (item) => item.id === workspace.organizationId,
  );
  const basePath = `/${workspace.slug}`;

  return (
    <WorkspacePageShell className="flex flex-col gap-8">
      {organization ? <TrialBanner organization={organization} /> : null}

      <PageHeader
        className="mb-0"
        title={workspace.name}
        description={`Signed in as ${formatRoleLabel(workspace.role)}.`}
      />

      <WorkspaceOverviewMetrics workspaceSlug={workspace.slug} />

      <Card>
        <CardHeader>
          <CardTitle>Recent campaigns</CardTitle>
          <CardDescription>
            Campaign activity will show here once sending ships. Nothing to
            list yet.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Link
            href={`${basePath}/campaigns`}
            className="inline-flex w-fit text-sm font-medium text-text underline-offset-4 hover:underline"
          >
            Open campaigns
          </Link>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>
              Design email layouts, save revisions, and export HTML.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Link
              href={`${basePath}/templates`}
              className="inline-flex w-fit text-sm font-medium text-text underline-offset-4 hover:underline"
            >
              Open templates
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Billing, trial, members, and workspaces live at the organization level.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Link
              href={`/org/${workspace.organizationId}/settings`}
              className="inline-flex w-fit text-sm font-medium text-text underline-offset-4 hover:underline"
            >
              Organization settings
            </Link>
          </CardBody>
        </Card>
      </div>
    </WorkspacePageShell>
  );
}
