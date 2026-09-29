"use client";

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Button,
  PageHeader,
  SaveBar,
  SaveStatus,
  SettingsContent,
  SettingsFooter,
  SettingsPane,
} from "@repo/ui/client";
import {
  hasWorkspaceRoleAtLeast,
  workspaceGeneralFormSchema,
  type WorkspaceGeneralFormValues,
} from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { useUpdateWorkspaceSettings } from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { WorkspaceDangerSection } from "@/components/workspace/workspace-danger-section";
import { WorkspaceGeneralSection } from "@/components/workspace/workspace-general-section";
import { WorkspaceIdentitySection } from "@/components/workspace/workspace-identity-section";
import {
  areGeneralValuesEqual,
  buildGeneralUpdate,
  countDirtyFields,
  generalFormValues,
  GENERAL_FORM_ID,
  generalSaveStatus,
  savedGeneralValues,
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

  const serverValues = generalFormValues(workspace);
  const form = useForm<WorkspaceGeneralFormValues>({
    resolver: zodResolver(workspaceGeneralFormSchema),
    defaultValues: serverValues,
    values: serverValues,
    resetOptions: { keepDirtyValues: true },
  });
  const {
    handleSubmit,
    reset,
    getValues,
    formState: { dirtyFields, errors },
  } = form;

  const submit = handleSubmit(async (values) => {
    const input = buildGeneralUpdate(workspace, values);
    const submitted = { ...getValues() };

    if (input) {
      try {
        await update.mutateAsync({ workspaceId: workspace.id, input });
      } catch {
        return;
      }
    }

    reset(savedGeneralValues(values), {
      keepDirtyValues: !areGeneralValuesEqual(getValues(), submitted),
    });
  });

  const isSaving = update.isPending;
  const dirtyCount = countDirtyFields(dirtyFields);
  const status = generalSaveStatus({
    isSaving,
    hasErrors: Object.keys(errors).length > 0,
    dirtyCount,
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
      <WorkspaceIdentitySection form={form} disabled={!canManage} />
      <WorkspaceGeneralSection form={form} disabled={!canManage} />
      <WorkspaceDangerSection />
    </SettingsContent>
  );

  if (!canManage) {
    return <SettingsPane>{fields}</SettingsPane>;
  }

  return (
    <form
      id={GENERAL_FORM_ID}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        void submit(event);
      }}
      onReset={(event) => {
        event.preventDefault();
        reset();
      }}
    >
      <SettingsPane>{fields}</SettingsPane>
      <SettingsFooter>
        <SaveBar
          form={GENERAL_FORM_ID}
          status={<SaveStatus tone={status.tone} label={status.label} />}
          discardDisabled={isSaving || dirtyCount === 0}
          saveDisabled={isSaving || dirtyCount === 0}
        />
      </SettingsFooter>
    </form>
  );
}
