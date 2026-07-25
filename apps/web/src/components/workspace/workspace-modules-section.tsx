"use client";

import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button, Input } from "@repo/ui/client";
import {
  buildModuleContentFromSource,
  getPlatformStarterByName,
  hasWorkspaceRoleAtLeast,
  MODULE_CREATE_SOURCES,
  summarizeModuleContent,
  type ModuleCreateSource,
  type WorkspaceModuleData,
} from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  useCreateWorkspaceModule,
  useDeleteWorkspaceModule,
  useUpdateWorkspaceModule,
  useWorkspaceModules,
} from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { ConfirmModal } from "@/components/template-builder/modals/confirm-modal";
import { SelectField } from "@/components/template-builder/inspector/fields";

type PendingAction =
  | { kind: "restore"; module: WorkspaceModuleData }
  | { kind: "delete"; moduleId: string; name: string }
  | null;

export function WorkspaceModulesSection() {
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const modulesQuery = useWorkspaceModules(workspace.id);
  const createModule = useCreateWorkspaceModule(workspace.id);
  const updateModule = useUpdateWorkspaceModule(workspace.id);
  const deleteModule = useDeleteWorkspaceModule(workspace.id);
  const create = useToastMutation({
    mutationFn: (input: Parameters<typeof createModule.mutateAsync>[0]) =>
      createModule.mutateAsync(input),
    successMessage: "Module created",
    errorMessage: "Could not create module",
  });
  const update = useToastMutation({
    mutationFn: (input: Parameters<typeof updateModule.mutateAsync>[0]) =>
      updateModule.mutateAsync(input),
    successMessage: "Module updated",
    errorMessage: "Could not update module",
  });
  const remove = useToastMutation({
    mutationFn: (moduleId: string) => deleteModule.mutateAsync(moduleId),
    successMessage: "Module deleted",
    errorMessage: "Could not delete module",
  });

  const [name, setName] = useState("");
  const [source, setSource] = useState<ModuleCreateSource>("blank");
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const prefill = {
    workspaceName: workspace.name,
    physicalAddress: workspace.physicalAddress,
    brandKit: workspace.brandKit,
  };

  function draftName(module: WorkspaceModuleData): string {
    return renameDrafts[module.id] ?? module.name;
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!canManage || !trimmed) {
      return;
    }
    create.mutate(
      {
        name: trimmed,
        content: buildModuleContentFromSource(source, prefill),
      },
      {
        onSuccess: () => {
          setName("");
          setSource("blank");
        },
      },
    );
  }

  function commitRename(module: WorkspaceModuleData) {
    const nextName = draftName(module).trim();
    if (!canManage || !nextName || nextName === module.name) {
      setRenameDrafts((prev) => {
        const next = { ...prev };
        delete next[module.id];
        return next;
      });
      return;
    }
    update.mutate(
      { moduleId: module.id, input: { name: nextName } },
      {
        onSuccess: () => {
          setRenameDrafts((prev) => {
            const next = { ...prev };
            delete next[module.id];
            return next;
          });
        },
      },
    );
  }

  async function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }
    try {
      if (pendingAction.kind === "delete") {
        await remove.mutateAsync(pendingAction.moduleId);
        setPendingAction(null);
        return;
      }

      const starter = getPlatformStarterByName(
        pendingAction.module.name,
        prefill,
      );
      if (!starter) {
        setPendingAction(null);
        return;
      }
      await update.mutateAsync({
        moduleId: pendingAction.module.id,
        input: { content: starter.content },
      });
      setPendingAction(null);
    } catch {
      // Toast handled by useToastMutation; keep dialog open for retry.
    }
  }

  if (!canManage) {
    return (
      <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
        <h2 className="text-ui-lg font-medium text-text-primary">Modules</h2>
        <p className="mt-2 text-ui-sm text-text-secondary">
          Only workspace admins can manage the module library. Members can still
          insert modules from the template builder.
        </p>
        {modulesQuery.data && modulesQuery.data.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {modulesQuery.data.map((module) => (
              <li
                key={module.id}
                className="rounded-lg border border-border-default bg-surface-muted px-3 py-2"
              >
                <p className="text-ui-sm font-medium text-text-primary">
                  {module.name}
                </p>
                <p className="text-ui-xs text-text-tertiary">
                  {summarizeModuleContent(module.content)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-ui-lg font-medium text-text-primary">Modules</h2>
        <p className="text-ui-sm text-text-secondary">
          Create reusable sections for the builder. Edit content in a template,
          then use Update from selection — or restore a platform starter here.
        </p>
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-border-default bg-surface-muted p-4">
        <p className="text-ui-sm font-medium text-text-primary">Create module</p>
        <label className="block space-y-1">
          <span className="text-ui-xs font-medium text-text-secondary">Name</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Promo banner"
          />
        </label>
        <SelectField
          label="Start from"
          value={source}
          onChange={(value) => setSource(value as ModuleCreateSource)}
          options={MODULE_CREATE_SOURCES}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={!name.trim() || create.isPending}
          onClick={handleCreate}
        >
          Create module
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-ui-sm font-medium text-text-primary">Library</p>
        {modulesQuery.isLoading ? (
          <p className="text-ui-xs text-text-tertiary">Loading modules…</p>
        ) : null}
        {modulesQuery.error ? (
          <p className="text-ui-xs text-danger">Could not load modules.</p>
        ) : null}
        {modulesQuery.data && modulesQuery.data.length === 0 ? (
          <p className="text-ui-xs text-text-tertiary">
            No modules yet. Create one above.
          </p>
        ) : null}
        <ul className="space-y-3">
          {modulesQuery.data?.map((module) => {
            const canRestore = Boolean(
              getPlatformStarterByName(module.name, prefill),
            );
            return (
              <li
                key={module.id}
                className="rounded-xl border border-border-default bg-surface-muted p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input
                      value={draftName(module)}
                      onChange={(event) =>
                        setRenameDrafts((prev) => ({
                          ...prev,
                          [module.id]: event.target.value,
                        }))
                      }
                      onBlur={() => commitRename(module)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                    />
                    <p className="text-ui-xs text-text-tertiary">
                      {summarizeModuleContent(module.content)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {canRestore ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={update.isPending}
                        onClick={() =>
                          setPendingAction({ kind: "restore", module })
                        }
                      >
                        <RotateCcw className="size-3.5" strokeWidth={1.5} />
                        Restore
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="text-danger"
                      disabled={remove.isPending}
                      onClick={() =>
                        setPendingAction({
                          kind: "delete",
                          moduleId: module.id,
                          name: module.name,
                        })
                      }
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.5} />
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <ConfirmModal
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
        title={
          pendingAction?.kind === "delete"
            ? "Delete module?"
            : "Restore starter content?"
        }
        description={
          pendingAction?.kind === "delete"
            ? `Remove “${pendingAction.name}” from the library. This cannot be undone with ⌘Z.`
            : pendingAction?.kind === "restore"
              ? `Replace “${pendingAction.module.name}” with the platform starter. This cannot be undone with ⌘Z.`
              : undefined
        }
        confirmLabel={
          pendingAction?.kind === "delete" ? "Delete" : "Restore starter"
        }
        variant={pendingAction?.kind === "delete" ? "danger" : "primary"}
        isPending={update.isPending || remove.isPending}
        onConfirm={confirmPendingAction}
      />
    </section>
  );
}
