"use client";

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Button,
  PageHeader,
  SaveBar,
  SaveStatus,
  SettingsContent,
  SettingsFooter,
  SettingsPane,
} from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { useUpdateWorkspaceSettings } from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { WorkspaceGeneralSection } from "@/components/workspace/workspace-general-section";
import { WorkspaceIdentitySection } from "@/components/workspace/workspace-identity-section";
import {
  GENERAL_FORM_ID,
  buildGeneralUpdate,
  syncGeneralForm,
} from "./workspace-general-form";

export function WorkspaceGeneralPage() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const updateWorkspaceSettings = useUpdateWorkspaceSettings();
  const update = useToastMutation({
    mutationFn: (
      input: Parameters<typeof updateWorkspaceSettings.mutateAsync>[0],
    ) => updateWorkspaceSettings.mutateAsync(input),
    successMessage: "Workspace updated",
    errorMessage: "Could not update workspace",
    onSuccess: (updated) => {
      if (updated.slug !== workspace.slug) {
        router.replace(`/${updated.slug}/settings`);
      }
    },
  });

  const fields = (
    <SettingsContent>
      <PageHeader
        title="General"
        description="Workspace identity and the postal address required on every email you send."
        actions={
          <Button
            variant="secondary"
            leftIcon={<BookOpen strokeWidth={1.5} />}
            title="Docs aren't available yet"
            disabled
          >
            Docs
          </Button>
        }
      />
      <WorkspaceIdentitySection />
      <WorkspaceGeneralSection />
    </SettingsContent>
  );

  if (!canManage) {
    return <SettingsPane>{fields}</SettingsPane>;
  }

  return (
    <form
      key={JSON.stringify({
        name: workspace.name,
        slug: workspace.slug,
        physicalAddress: workspace.physicalAddress ?? null,
      })}
      id={GENERAL_FORM_ID}
      ref={(form) => {
        if (form) {
          syncGeneralForm(form, update.isPending ? "saving" : "idle");
        }
      }}
      className="flex min-h-0 flex-1 flex-col"
      onInput={(event) => syncGeneralForm(event.currentTarget)}
      onReset={(event) => {
        const form = event.currentTarget;
        queueMicrotask(() => syncGeneralForm(form));
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const input = buildGeneralUpdate(workspace, form);

        if (!input) {
          return;
        }

        syncGeneralForm(form, "saving");
        void update
          .mutateAsync({
            workspaceId: workspace.id,
            input,
          })
          .catch(() => {
            syncGeneralForm(form);
          });
      }}
    >
      <SettingsPane>{fields}</SettingsPane>
      <SettingsFooter>
        <SaveBar
          form={GENERAL_FORM_ID}
          status={<SaveStatus tone="unsaved" label="No unsaved changes" />}
        />
      </SettingsFooter>
    </form>
  );
}
