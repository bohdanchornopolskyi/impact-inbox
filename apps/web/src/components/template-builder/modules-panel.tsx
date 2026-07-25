"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, RotateCcw, Trash2 } from "lucide-react";
import { Button, Input, cn } from "@repo/ui/client";
import {
  findBlock,
  getPlatformStarterByName,
  hasWorkspaceRoleAtLeast,
  isEmptyModuleSection,
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
import { showError } from "@/stores/toast-store";
import { useBuilder } from "./builder-provider";
import { ConfirmModal } from "./modals/confirm-modal";

type PendingLibraryAction =
  | { kind: "update"; module: WorkspaceModuleData; content: SectionBlock }
  | { kind: "restore"; module: WorkspaceModuleData; content: SectionBlock }
  | { kind: "delete"; moduleId: string }
  | null;

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
    successMessage: "Module library updated",
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
  const [pendingAction, setPendingAction] = useState<PendingLibraryAction>(null);

  const sectionId = resolveSectionId(content, selectedBlockId);
  const foundSection =
    sectionId !== undefined ? findBlock(content, sectionId) : undefined;
  const selectedSection =
    foundSection?.block.type === "section" ? foundSection.block : undefined;
  const canSaveSection =
    canManage &&
    selectedSection !== undefined &&
    !isEmptyModuleSection(selectedSection) &&
    Boolean(saveName.trim());

  const selectedModule =
    modulesQuery.data?.find((module) => module.id === selectedModuleId) ?? null;
  const starterForSelected = selectedModule
    ? getPlatformStarterByName(selectedModule.name, {
        workspaceName: workspace.name,
        physicalAddress: workspace.physicalAddress,
        brandKit: workspace.brandKit,
      })
    : undefined;

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
    if (isEmptyModuleSection(selectedSection)) {
      showError("Choose a section that has content before saving.");
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

  function requestUpdateFromSelection(module: WorkspaceModuleData) {
    if (!canManage || !selectedSection) {
      return;
    }
    if (isEmptyModuleSection(selectedSection)) {
      showError("Selected section is empty. Add blocks before updating the library.");
      return;
    }
    setPendingAction({
      kind: "update",
      module,
      content: selectedSection,
    });
  }

  function requestRestoreStarter(module: WorkspaceModuleData) {
    if (!canManage) {
      return;
    }
    const starter = getPlatformStarterByName(module.name, {
      workspaceName: workspace.name,
      physicalAddress: workspace.physicalAddress,
      brandKit: workspace.brandKit,
    });
    if (!starter) {
      return;
    }
    setPendingAction({
      kind: "restore",
      module,
      content: starter.content,
    });
  }

  function requestDelete(moduleId: string) {
    setPendingAction({ kind: "delete", moduleId });
  }

  async function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    try {
      if (pendingAction.kind === "delete") {
        await remove.mutateAsync(pendingAction.moduleId);
        if (selectedModuleId === pendingAction.moduleId) {
          setSelectedModuleId(null);
        }
        setPendingAction(null);
        return;
      }

      await update.mutateAsync({
        moduleId: pendingAction.module.id,
        input: { content: pendingAction.content },
      });
      setPendingAction(null);
    } catch {
      // Toast handled by useToastMutation; keep dialog open for retry.
    }
  }

  const confirmTitle =
    pendingAction?.kind === "delete"
      ? "Delete module?"
      : pendingAction?.kind === "restore"
        ? "Restore starter content?"
        : "Replace module content?";
  const confirmDescription =
    pendingAction?.kind === "delete"
      ? "This removes the module from the workspace library. Template canvas undo (⌘Z) cannot reverse library changes."
      : pendingAction?.kind === "restore"
        ? `Replace “${pendingAction.module.name}” with the platform starter. This is not undoable with ⌘Z.`
        : pendingAction
          ? `Replace “${pendingAction.module.name}” with the selected canvas section. Library edits are not undoable with ⌘Z.`
          : undefined;
  const confirmLabel =
    pendingAction?.kind === "delete"
      ? "Delete"
      : pendingAction?.kind === "restore"
        ? "Restore starter"
        : "Replace content";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border-subtle px-4 py-3">
        <h2 className="text-ui-sm font-semibold text-text-primary">Modules</h2>
        <p className="mt-0.5 text-ui-xs text-text-tertiary">
          Insert a copy into this template.{" "}
          <Link
            href={`/${workspace.slug}/settings?tab=modules`}
            className="text-accent-text underline-offset-2 hover:underline"
          >
            Manage library in settings
          </Link>
          .
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {canManage ? (
          <div className="mb-4 space-y-2 rounded-lg border border-border-default bg-surface-muted p-3">
            <p className="text-ui-xs font-medium text-text-secondary">
              Save canvas section to library
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
            ) : isEmptyModuleSection(selectedSection) ? (
              <p className="text-ui-xs text-text-tertiary">
                Selected section is empty — add blocks before saving.
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
              disabled={!canEdit || isEmptyModuleSection(selectedModule.content)}
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
                  disabled={
                    !selectedSection ||
                    isEmptyModuleSection(selectedSection) ||
                    update.isPending
                  }
                  onClick={() => requestUpdateFromSelection(selectedModule)}
                >
                  Update from selection
                </Button>
                {!selectedSection ? (
                  <p className="text-ui-xs text-text-tertiary">
                    Select a canvas section to replace this module’s content.
                  </p>
                ) : isEmptyModuleSection(selectedSection) ? (
                  <p className="text-ui-xs text-text-tertiary">
                    Selected section is empty — library updates need content.
                  </p>
                ) : (
                  <p className="text-ui-xs text-text-tertiary">
                    Library changes are separate from canvas undo (⌘Z).
                  </p>
                )}
                {starterForSelected ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={update.isPending}
                    onClick={() => requestRestoreStarter(selectedModule)}
                  >
                    <RotateCcw className="mr-1.5 size-3.5" strokeWidth={1.5} />
                    Restore starter
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full text-danger"
                  disabled={remove.isPending}
                  onClick={() => requestDelete(selectedModule.id)}
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

      <ConfirmModal
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        variant={pendingAction?.kind === "delete" ? "danger" : "primary"}
        isPending={update.isPending || remove.isPending}
        onConfirm={confirmPendingAction}
      />
    </div>
  );
}
