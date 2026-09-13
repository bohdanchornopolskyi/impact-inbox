"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardDescription, CardHeader, CardTitle, Input } from "@repo/ui/client";
import {
  hasWorkspaceRoleAtLeast,
  type UpdateWorkspaceInput,
} from "@repo/shared";
import { ApiFormError } from "@/components/ui/api-form-error";
import { useWorkspace } from "@/contexts/workspace-context";
import { useUpdateWorkspaceSettings } from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";

export function WorkspaceIdentitySection() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const updateWorkspaceSettings = useUpdateWorkspaceSettings();
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);

  useEffect(() => {
    setName(workspace.name);
    setSlug(workspace.slug);
  }, [workspace.name, workspace.slug]);

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

  const trimmedName = name.trim();
  const trimmedSlug = slug.trim();
  const hasChanges =
    trimmedName !== workspace.name || trimmedSlug !== workspace.slug;
  const canSave = Boolean(trimmedName && trimmedSlug && hasChanges);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace details</CardTitle>
        <CardDescription>
          The slug appears in workspace URLs. Old links keep redirecting after a
          change.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={name}
            disabled={!canManage}
            onChange={(event) => setName(event.target.value)}
            placeholder="Acme Marketing"
          />
          <Input
            label="Slug"
            value={slug}
            disabled={!canManage}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="acme-marketing"
            mono
          />
        </div>
        {canManage ? (
          <>
            <ApiFormError error={update.error} />
            <Button
              variant="primary"
              disabled={!canSave || update.isPending}
              onClick={() => {
                const input: UpdateWorkspaceInput = {
                  ...(trimmedName !== workspace.name ? { name: trimmedName } : {}),
                  ...(trimmedSlug !== workspace.slug ? { slug: trimmedSlug } : {}),
                };

                update.mutate({
                  workspaceId: workspace.id,
                  input,
                });
              }}
            >
              Save details
            </Button>
          </>
        ) : null}
      </CardBody>
    </Card>
  );
}
