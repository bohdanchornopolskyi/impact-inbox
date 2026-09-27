"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Ellipsis } from "lucide-react";
import {
  getPlatformStarterByName,
  hasWorkspaceRoleAtLeast,
  isEmptyModuleSection,
  isPlatformStarterName,
  modulePreviewCopy,
  summarizeModuleContent,
  type SectionBlock,
  type WorkspaceModuleData,
} from "@repo/shared";
import {
  Button,
  DropdownMenu,
  EditorPanelFooter,
  EditorPanelGroup,
  EditorPanelListHead,
  EditorPanelScroll,
  EditorPanelSearch,
  Input,
  SavedTile,
} from "@repo/ui/client";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  useDeleteWorkspaceModule,
  useUpdateWorkspaceModule,
  useWorkspaceModules,
} from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { showError } from "@/stores/toast-store";
import { useBuilder, useBuilderStore } from "./builder-provider";
import { filterEditorPanel } from "./filter-editor-panel";
import { ConfirmModal } from "./modals/confirm-modal";
import {
  moduleSaveTargetState,
  resolveSelectedSection,
  suggestedSaveName,
} from "./module-save-target";
import { groupSavedModules } from "./saved-library-groups";
import { SectionPreview } from "./section-preview";
import { useSaveSectionToLibrary } from "./use-save-section-to-library";

type PendingLibraryAction =
  | { kind: "update"; module: WorkspaceModuleData; content: SectionBlock }
  | { kind: "restore"; module: WorkspaceModuleData; content: SectionBlock }
  | { kind: "delete"; moduleId: string }
  | null;

function formatModuleCount(count: number) {
  return `${count} ${count === 1 ? "module" : "modules"}`;
}

function SaveFromCanvas({
  canManage,
  isPending,
  onSave,
}: {
  canManage: boolean;
  isPending: boolean;
  onSave: (name: string, onSaved: () => void) => void;
}) {
  const saveTarget = useBuilder((s) =>
    moduleSaveTargetState(s.content, s.selectedBlockId),
  );
  const selectedSection = useBuilder((s) =>
    resolveSelectedSection(s.content, s.selectedBlockId),
  );
  const label = selectedSection
    ? suggestedSaveName(selectedSection)
    : "section";

  return (
    <form
      className="mx-3 mb-1 rounded-md border border-border bg-surface p-2"
      onSubmit={(event) => {
        event.preventDefault();
        const name = String(
          new FormData(event.currentTarget).get("name") ?? "",
        ).trim();
        if (!name) {
          return;
        }
        const form = event.currentTarget;
        onSave(name, () => form.reset());
      }}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text">
        <Bookmark className="size-3.5 shrink-0 text-text-2" strokeWidth={1.5} />
        Save {label} from canvas
      </p>
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <Input
            key={selectedSection?.id ?? "none"}
            name="name"
            defaultValue={label === "section" ? "" : label}
            placeholder="Name"
            aria-label="Module name"
            disabled={!canManage || saveTarget === "none"}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!canManage || saveTarget !== "ready" || isPending}
        >
          Save
        </Button>
      </div>
      {saveTarget === "none" ? (
        <p className="mt-1.5 text-2xs text-text-3">
          Select a section (or a block inside one) first.
        </p>
      ) : null}
      {saveTarget === "empty" ? (
        <p className="mt-1.5 text-2xs text-text-3">
          Selected section is empty — add blocks before saving.
        </p>
      ) : null}
    </form>
  );
}

function SavedModuleTile({
  module,
  canManage,
  canEdit,
  saveTarget,
  onInsert,
  onUpdateFromSelection,
  onRestoreStarter,
  onRename,
  onDelete,
}: {
  module: WorkspaceModuleData;
  canManage: boolean;
  canEdit: boolean;
  saveTarget: "none" | "empty" | "ready";
  onInsert: (content: SectionBlock) => void;
  onUpdateFromSelection: (module: WorkspaceModuleData) => void;
  onRestoreStarter: (module: WorkspaceModuleData) => void;
  onRename: (module: WorkspaceModuleData, name: string) => void;
  onDelete: (moduleId: string) => void;
}) {
  const summary = isEmptyModuleSection(module.content)
    ? summarizeModuleContent(module.content)
    : modulePreviewCopy(module.content);
  const starterAvailable = isPlatformStarterName(module.name);
  const dialogId = `rename-module-${module.id}`;

  return (
    <div data-filter={`${module.name} ${summary}`.toLowerCase()}>
      <SavedTile
        name={module.name}
        summary={summary}
        preview={
          isEmptyModuleSection(module.content) ? undefined : (
            <SectionPreview section={module.content} />
          )
        }
        onInsert={
          canEdit && !isEmptyModuleSection(module.content)
            ? () => onInsert(module.content)
            : undefined
        }
        more={
          <DropdownMenu
            align="end"
            aria-label={`Actions for ${module.name}`}
            trigger={<Ellipsis className="size-4" strokeWidth={1.5} />}
            items={[
              {
                label: "Update from selection",
                disabled: !canManage || saveTarget !== "ready",
                onSelect: () => onUpdateFromSelection(module),
              },
              {
                label: "Rename",
                disabled: !canManage,
                onSelect: () => {
                  const dialog = document.getElementById(dialogId);
                  if (dialog instanceof HTMLDialogElement) {
                    dialog.showModal();
                  }
                },
              },
              ...(starterAvailable && canManage
                ? [
                    {
                      label: "Restore starter",
                      onSelect: () => onRestoreStarter(module),
                    },
                  ]
                : []),
              {
                label: "Delete",
                destructive: true,
                disabled: !canManage,
                separatorBefore: true,
                onSelect: () => onDelete(module.id),
              },
            ]}
          />
        }
      />
      <dialog
        id={dialogId}
        aria-labelledby={`${dialogId}-title`}
        className="w-72 rounded-md border border-border bg-surface p-3 shadow-md backdrop:bg-black/20"
      >
        <form
          method="dialog"
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            const submitter = (event.nativeEvent as SubmitEvent).submitter;
            if (
              submitter instanceof HTMLButtonElement &&
              submitter.value === "cancel"
            ) {
              return;
            }
            const name = String(
              new FormData(event.currentTarget).get("name") ?? "",
            ).trim();
            if (name) {
              onRename(module, name);
            }
          }}
        >
          <p id={`${dialogId}-title`} className="text-sm font-semibold text-text">
            Rename
          </p>
          <Input name="name" label="Name" defaultValue={module.name} />
          <div className="flex justify-end gap-1.5">
            <Button type="submit" value="cancel" variant="secondary" size="sm">
              Cancel
            </Button>
            <Button type="submit" value="save" size="sm">
              Save
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

export function ModulesPanel() {
  const { workspace } = useWorkspace();
  const store = useBuilderStore();
  const canEdit = useBuilder((s) => s.canEdit);
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const saveTarget = useBuilder((s) =>
    moduleSaveTargetState(s.content, s.selectedBlockId),
  );
  const modulesQuery = useWorkspaceModules(workspace.id);
  const updateModule = useUpdateWorkspaceModule(workspace.id);
  const deleteModule = useDeleteWorkspaceModule(workspace.id);
  const { saveSelectedSection, isPending: isSaving } = useSaveSectionToLibrary();
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
  const [pendingAction, setPendingAction] = useState<PendingLibraryAction>(null);

  const modules = modulesQuery.data ?? [];
  const groups = groupSavedModules(modules);

  function handleInsert(moduleContent: SectionBlock) {
    const state = store.getState();
    if (!state.canEdit) {
      return;
    }
    state.insertSavedModule(moduleContent);
  }

  function handleRename(module: WorkspaceModuleData, nextName: string) {
    if (!canManage || !nextName || nextName === module.name) {
      return;
    }
    update.mutate({
      moduleId: module.id,
      input: { name: nextName },
    });
  }

  function requestUpdateFromSelection(module: WorkspaceModuleData) {
    if (!canManage) {
      return;
    }
    const { content, selectedBlockId } = store.getState();
    const selectedSection = resolveSelectedSection(content, selectedBlockId);
    if (!selectedSection) {
      return;
    }
    if (isEmptyModuleSection(selectedSection)) {
      showError(
        "Selected section is empty. Add blocks before updating the library.",
      );
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden" data-panel>
      <EditorPanelSearch
        placeholder="Search saved"
        aria-label="Search saved"
        onInput={(event) => {
          const root = event.currentTarget.closest("[data-panel]");
          if (root instanceof HTMLElement) {
            filterEditorPanel(root, event.currentTarget.value);
          }
        }}
      />
      {canManage ? (
        <SaveFromCanvas
          canManage={canManage}
          isPending={isSaving}
          onSave={saveSelectedSection}
        />
      ) : null}
      <EditorPanelScroll>
        {modulesQuery.isLoading ? (
          <p className="px-0.5 text-xs text-text-3">Loading modules…</p>
        ) : null}
        {modulesQuery.error ? (
          <p className="px-0.5 text-xs text-danger">Could not load modules.</p>
        ) : null}
        {modulesQuery.data && modulesQuery.data.length === 0 ? (
          <p className="px-0.5 text-xs text-text-3">
            No modules yet. Save a section or create a new workspace for
            starters.
          </p>
        ) : null}
        {modules.length > 0 ? (
          <>
            <EditorPanelListHead
              title="Saved library"
              meta={formatModuleCount(modules.length)}
            />
            <p data-filter-empty hidden className="px-0.5 text-xs text-text-3">
              No saved items match your search.
            </p>
            <div className="flex flex-col gap-4.5">
              {groups.map((group) => (
                <EditorPanelGroup
                  key={group.title}
                  title={group.title}
                  meta={formatModuleCount(group.modules.length)}
                  defaultOpen={false}
                  data-filter-group=""
                >
                  <div className="flex flex-col gap-2">
                    {group.modules.map((module) => (
                      <SavedModuleTile
                        key={module.id}
                        module={module}
                        canManage={canManage}
                        canEdit={canEdit}
                        saveTarget={saveTarget}
                        onInsert={handleInsert}
                        onUpdateFromSelection={requestUpdateFromSelection}
                        onRestoreStarter={requestRestoreStarter}
                        onRename={handleRename}
                        onDelete={requestDelete}
                      />
                    ))}
                  </div>
                </EditorPanelGroup>
              ))}
            </div>
          </>
        ) : null}
      </EditorPanelScroll>
      <EditorPanelFooter>
        <Link
          href={`/${workspace.slug}/settings?tab=modules`}
          className="inline-flex h-7 items-center rounded-sm px-2 text-xs font-medium text-text-2 transition-colors duration-150 hover:bg-surface-sunken hover:text-text"
        >
          Manage
        </Link>
      </EditorPanelFooter>
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
