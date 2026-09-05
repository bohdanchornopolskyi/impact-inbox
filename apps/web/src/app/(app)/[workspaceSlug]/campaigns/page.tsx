import { EmptyState } from "@repo/ui/client";
import {
  WorkspacePageHeader,
  WorkspacePageShell,
} from "@/components/app/workspace-page-chrome";

export default function CampaignsPage() {
  return (
    <WorkspacePageShell>
      <WorkspacePageHeader
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
