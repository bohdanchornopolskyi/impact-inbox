import { EmptyState, PageHeader } from "@repo/ui/client";
import { WorkspacePageShell } from "@/components/app/workspace-page-chrome";

export default function CampaignsPage() {
  return (
    <WorkspacePageShell>
      <PageHeader
        className="mb-5"
        title="Campaigns"
        description="Campaign sending arrives in a later phase."
      />
      <EmptyState
        title="No campaigns yet"
        description="Pick a template and send your first campaign in a few minutes."
      />
    </WorkspacePageShell>
  );
}
