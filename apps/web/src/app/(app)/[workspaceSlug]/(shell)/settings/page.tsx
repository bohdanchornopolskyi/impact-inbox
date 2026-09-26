import { Suspense } from "react";
import { WorkspacePageShell } from "@/components/app/workspace-page-chrome";
import { WorkspaceSettingsView } from "@/components/workspace/workspace-settings-view";

export default function WorkspaceSettingsPage() {
  return (
    <Suspense
      fallback={
        <WorkspacePageShell>
          <p className="text-ui-sm text-text-secondary">Loading settings…</p>
        </WorkspacePageShell>
      }
    >
      <WorkspaceSettingsView />
    </Suspense>
  );
}
