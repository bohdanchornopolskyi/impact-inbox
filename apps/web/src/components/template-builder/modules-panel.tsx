"use client";

import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button, Input, cn } from "@repo/ui/client";
import {
  findBlock,
  hasWorkspaceRoleAtLeast,
  resolveSectionId,
  summarizeModuleContent,
  type SectionBlock,
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
  const updateModule = useUpdateWorkspaceModule(workspace.id);
  const deleteModule = useDeleteWorkspaceModule(workspace.id);
  const create = useToastMutation({
    mutationFn: (input: Parameters<typeof createModule.mutateAsync>[0]) =>
      createModule.mutateAsync(input),
    successMessage: "Saved to module library",
    errorMessage: "Could not save module",
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
  const [saveName, setSaveName] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const sectionId = resolveSectionId(content, selectedBlockId);
  const foundSection =
    sectionId !== undefined ? findBlock(content, sectionId) : undefined;
  const selectedSection =
    foundSection?.block.type === "section" ? foundSection.block : undefined;
  const canSaveSection =
    canManage && selectedSection !== undefined && Boolean(saveName.trim());

  const selectedModule =
    modulesQuery.data?.find((module) => module.id === selectedModuleId) ?? null;

  useEffect(() => {
    if (!selectedModule) {
      setRenameValue("");
      return;
    }
    setRenameValue(selectedModule.name);
  }, [selectedModule]);

  useEffect(() => {
    if (
      selectedModuleId &&
      modulesQuery.data &&
      !modulesQuery.data.some((module) => module.id === selectedModuleId)
    ) {
      setSelectedModuleId(null);
    }
  }, [modulesQuery.data, selectedModuleId]);

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
        onSuccess: (created) => {
          setSaveName("");
          setSelectedModuleId(created.id);
        },
      },
    );
  }

  function handleRename(module: WorkspaceModuleData) {
    const nextName = renameValue.trim();
    if (!canManage || !nextName || nextName === module.name) {
      return;
    }
    update.mutate({
      moduleId: module.id,
      input: { name: nextName },
    });
  }

  function handleUpdateFromSelection(module: WorkspaceModuleData) {
    if (!canManage || !selectedSection) {
      return;
    }
    update.mutate({
      moduleId: module.id,
      input: { content: selectedSection },
    });
  }

  function handleDelete(moduleId: string) {
    remove.mutate(moduleId, {
      onSuccess: () => {
        if (selectedModuleId === moduleId) {
          setSelectedModuleId(null);
        }
      },
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border-subtle px-4 py-3">
        <h2 className="text-ui-sm font-semibold text-text-primary">Modules</h2>
        <p className="mt-0.5 text-ui-xs text-text-tertiary">
          Select a module to preview, then insert a copy.
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
          {modulesQuery.data?.map((module) => {
            const isSelected = module.id === selectedModuleId;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setSelectedModuleId(module.id)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg border p-2.5 text-left transition-colors",
                  isSelected
                    ? "border-accent-border bg-accent-soft"
                    : "border-border-default bg-surface-muted hover:border-accent-border",
                )}
              >
                <Bookmark
                  className="mt-0.5 size-4 shrink-0 text-text-secondary"
                  strokeWidth={1.5}
                />
                <span className="min-w-0">
                  <span className="block truncate text-ui-sm font-medium text-text-primary">
                    {module.name}
                  </span>
                  <span className="block truncate text-ui-xs text-text-tertiary">
                    {summarizeModuleContent(module.content)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {selectedModule ? (
          <div className="mt-4 space-y-3 rounded-lg border border-border-default bg-surface-card p-3">
            <div>
              <p className="text-ui-xs font-medium text-text-secondary">Selected</p>
              <p className="mt-1 text-ui-sm font-semibold text-text-primary">
                {selectedModule.name}
              </p>
              <p className="mt-1 text-ui-xs text-text-tertiary">
                {summarizeModuleContent(selectedModule.content)}
              </p>
            </div>

            {canManage ? (
              <div className="space-y-2">
                <label className="block space-y-1">
                  <span className="text-ui-xs font-medium text-text-secondary">
                    Name
                  </span>
                  <Input
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onBlur={() => handleRename(selectedModule)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.currentTarget.blur();
                      }
                    }}
                  />
                </label>
              </div>
            ) : null}

            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full"
              disabled={!canEdit}
              onClick={() => handleInsert(selectedModule.content)}
            >
              Insert into template
            </Button>

            {canManage ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={!selectedSection || update.isPending}
                  onClick={() => handleUpdateFromSelection(selectedModule)}
                >
                  Update from selection
                </Button>
                {!selectedSection ? (
                  <p className="text-ui-xs text-text-tertiary">
                    Select a canvas section to replace this module’s content.
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full text-danger"
                  disabled={remove.isPending}
                  onClick={() => handleDelete(selectedModule.id)}
                >
                  <Trash2 className="mr-1.5 size-3.5" strokeWidth={1.5} />
                  Delete module
                </Button>
              </>
            ) : null}
          </div>
        ) : modulesQuery.data && modulesQuery.data.length > 0 ? (
          <p className="mt-4 px-0.5 text-ui-xs text-text-tertiary">
            Select a module to preview and insert.
          </p>
        ) : null}
      </div>
    </div>
  );
}
