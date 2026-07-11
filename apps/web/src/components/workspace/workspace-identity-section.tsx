"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@repo/ui/client";
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

  if (!canManage) {
    return (
      <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
              Name
            </dt>
            <dd className="mt-1 text-ui-sm text-text-primary">{workspace.name}</dd>
          </div>
          <div>
            <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
              Slug
            </dt>
            <dd className="mt-1 font-mono text-ui-sm text-text-primary">
              {workspace.slug}
            </dd>
          </div>
        </dl>
      </section>
    );
  }

  const trimmedName = name.trim();
  const trimmedSlug = slug.trim();
  const hasChanges =
    trimmedName !== workspace.name || trimmedSlug !== workspace.slug;
  const canSave = Boolean(trimmedName && trimmedSlug && hasChanges);

  return (
    <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
      <h2 className="text-ui-lg font-medium text-text-primary">Details</h2>
      <p className="mt-1 text-ui-sm text-text-secondary">
        Changing the slug updates workspace URLs. Old links redirect
        automatically.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme Marketing"
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="acme-marketing"
          mono
        />
      </div>
      <ApiFormError error={update.error} />
      <Button
        className="mt-4"
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
    </section>
  );
}
