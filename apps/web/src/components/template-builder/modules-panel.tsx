"use client";

import { useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button, Input } from "@repo/ui/client";
import {
  findBlock,
  hasWorkspaceRoleAtLeast,
  resolveSectionId,
  type SectionBlock,
} from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  useCreateWorkspaceModule,
  useDeleteWorkspaceModule,
  useWorkspaceModules,
} from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { useBuilder } from "./builder-provider";

export function ModulesPanel() {
  const { workspace } = useWorkspace();
  const canEdit = useBuilder((s) => s.canEdit);
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const content = useBuilder((s) => s.content);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const insertSavedModule = useBuilder((s) => s.insertSavedModule);
  const modulesQuery = useWorkspaceModules(workspace.id);
  const createModule = useCreateWorkspaceModule(workspace.id);
  const deleteModule = useDeleteWorkspaceModule(workspace.id);
  const create = useToastMutation({
    mutationFn: (input: Parameters<typeof createModule.mutateAsync>[0]) =>
      createModule.mutateAsync(input),
    successMessage: "Saved to module library",
    errorMessage: "Could not save module",
  });
  const remove = useToastMutation({
    mutationFn: (moduleId: string) => deleteModule.mutateAsync(moduleId),
    successMessage: "Module deleted",
    errorMessage: "Could not delete module",
  });
  const [saveName, setSaveName] = useState("");

  const sectionId = resolveSectionId(content, selectedBlockId);
  const foundSection =
    sectionId !== undefined ? findBlock(content, sectionId) : undefined;
  const selectedSection =
    foundSection?.block.type === "section" ? foundSection.block : undefined;
  const canSaveSection =
    canManage && selectedSection !== undefined && Boolean(saveName.trim());

  function handleInsert(moduleContent: SectionBlock) {
    if (!canEdit) {
      return;
    }
    insertSavedModule(moduleContent);
  }

  function handleSave() {
    if (!canSaveSection || !selectedSection) {
      return;
    }
    create.mutate(
      { name: saveName.trim(), content: selectedSection },
      {
        onSuccess: () => setSaveName(""),
      },
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border-subtle px-4 py-3">
        <h2 className="text-ui-sm font-semibold text-text-primary">Modules</h2>
        <p className="mt-0.5 text-ui-xs text-text-tertiary">
          Insert reusable sections. Copies into this template.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {canManage ? (
          <div className="mb-4 space-y-2 rounded-lg border border-border-default bg-surface-muted p-3">
            <p className="text-ui-xs font-medium text-text-secondary">
              Save selected section
            </p>
            <Input
              value={saveName}
              onChange={(event) => setSaveName(event.target.value)}
              placeholder="Module name"
              disabled={!selectedSection}
            />
            <Button
              type="button"
              size="sm"
              className="w-full"
              disabled={!canSaveSection || create.isPending}
              onClick={handleSave}
            >
              Save to library
            </Button>
            {!selectedSection ? (
              <p className="text-ui-xs text-text-tertiary">
                Select a section (or a block inside one) first.
              </p>
            ) : null}
          </div>
        ) : null}

        {modulesQuery.isLoading ? (
          <p className="px-0.5 text-ui-xs text-text-tertiary">Loading modules…</p>
        ) : null}

        {modulesQuery.error ? (
          <p className="px-0.5 text-ui-xs text-danger">Could not load modules.</p>
        ) : null}

        {modulesQuery.data && modulesQuery.data.length === 0 ? (
          <p className="px-0.5 text-ui-xs text-text-tertiary">
            No modules yet. Save a section or create a new workspace for starters.
          </p>
        ) : null}

        <div className="space-y-2">
          {modulesQuery.data?.map((module) => (
            <div
              key={module.id}
              className="group flex items-start gap-2 rounded-lg border border-border-default bg-surface-muted p-2.5"
            >
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => handleInsert(module.content)}
                className="flex min-w-0 flex-1 items-start gap-2 text-left transition-colors hover:text-accent-fg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Bookmark
                  className="mt-0.5 size-4 shrink-0 text-text-secondary"
                  strokeWidth={1.5}
                />
                <span className="min-w-0">
                  <span className="block truncate text-ui-sm font-medium text-text-primary">
                    {module.name}
                  </span>
                  <span className="block text-ui-xs text-text-tertiary">
                    Click to insert
                  </span>
                </span>
              </button>
              {canManage ? (
                <button
                  type="button"
                  aria-label={`Delete ${module.name}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(module.id)}
                  className="rounded p-1 text-text-tertiary opacity-0 transition-opacity hover:bg-surface-card hover:text-danger group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
