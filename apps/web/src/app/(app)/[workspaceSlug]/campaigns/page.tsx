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
    </WorkspacePageShell>
  );
}
