"use client";

import Link from "next/link";
import { Card, CardBody, CardDescription, CardHeader, CardTitle, MetricTile } from "@repo/ui/client";
import { TrialBanner } from "@/components/app/trial-banner";
import {
  WorkspacePageHeader,
  WorkspacePageShell,
} from "@/components/app/workspace-page-chrome";
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
    <WorkspacePageShell className="flex flex-col gap-8">
      {organization ? <TrialBanner organization={organization} /> : null}

      <WorkspacePageHeader
        className="mb-0"
        title={workspace.name}
        description={`Signed in as ${formatRoleLabel(workspace.role)}.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {PLACEHOLDER_STATS.map((stat) => (
          <Link key={stat.label} href={`${basePath}${stat.hrefSuffix}`} className="block">
            <MetricTile label={stat.label} value="—" period="Coming soon" />
          </Link>
        ))}
      </div>

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
