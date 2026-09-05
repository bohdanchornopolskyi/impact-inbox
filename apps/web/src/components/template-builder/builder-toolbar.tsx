"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Eye,
  History,
  Pencil,
  Redo2,
  Undo2,
  Upload,
} from "lucide-react";
import { Button, SaveStatus } from "@repo/ui/client";
import { formatDistanceToNow } from "date-fns";
import { parseApiDate } from "@/lib/format-date";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  useApplyTemplateRename,
  useBuilder,
  useBuilderFlush,
  useSaveRevision,
} from "./builder-provider";
import { RenameTemplateModal } from "./modals/rename-template-modal";
import { useBuilderShortcuts } from "./use-builder-shortcuts";

function WorkingCopySyncStatus() {
  const saveState = useBuilder((s) => s.saveState);
  const updatedAt = useBuilder((s) => s.updatedAt);
  const flush = useBuilderFlush();

  if (saveState === "saving") {
    return <SaveStatus tone="saving" label="Saving" />;
  }

  if (saveState === "error") {
    return (
      <SaveStatus
        tone="error"
        label="Couldn't save"
        onRetry={() => {
          void flush();
        }}
      />
    );
  }

  if (saveState === "unsaved") {
    return <SaveStatus tone="unsaved" label="Unsaved changes" />;
  }

  const savedAt = parseApiDate(updatedAt);

  return (
    <SaveStatus
      tone="saved"
      label={
        savedAt
          ? `Saved ${formatDistanceToNow(savedAt, { addSuffix: true })}`
          : "Saved"
      }
    />
  );
}

export function BuilderToolbar() {
  useBuilderShortcuts();
  const { workspace } = useWorkspace();
  const templateId = useBuilder((s) => s.templateId);
  const name = useBuilder((s) => s.name);
  const updatedAt = useBuilder((s) => s.updatedAt);
  const canEdit = useBuilder((s) => s.canEdit);
  const saveState = useBuilder((s) => s.saveState);
  const canUndo = useBuilder((s) => s.history.past.length > 0);
  const canRedo = useBuilder((s) => s.history.future.length > 0);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const setPreviewOpen = useBuilder((s) => s.setPreviewOpen);
  const setRevisionsOpen = useBuilder((s) => s.setRevisionsOpen);
  const setExportOpen = useBuilder((s) => s.setExportOpen);
  const applyRename = useApplyTemplateRename();
  const { saveRevision, isPending: isSaving } = useSaveRevision();
  const [renameOpen, setRenameOpen] = useState(false);

  async function handleSaveRevision() {
    await saveRevision();
  }

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border-default bg-surface-card px-4">
      <Link
        href={`/${workspace.slug}/templates`}
        className="inline-flex items-center gap-1 text-ui-sm text-text-secondary hover:text-text-primary"
        title={
          saveState === "unsaved"
            ? "Changes autosave — leaving keeps your template"
            : undefined
        }>
        <ChevronLeft className="size-4" strokeWidth={1.5} />
        Templates
      </Link>
      <div className="h-5 w-px bg-border-default" />
      <div className="min-w-0 flex-1">
        {canEdit ? (
          <button
            type="button"
            className="group inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md px-1 -mx-1 text-left hover:bg-surface-muted"
            title="Rename template"
            onClick={() => setRenameOpen(true)}>
            <span className="truncate text-ui-md font-semibold text-text-primary">
              {name}
            </span>
            <Pencil
              className="size-3.5 shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <p className="truncate text-ui-md font-semibold text-text-primary">
            {name}
          </p>
        )}
      </div>
      <WorkingCopySyncStatus />
      {canEdit ? (
        <div className="flex items-center gap-0.5">
          <Button
            icon
            variant="ghost"
            disabled={!canUndo}
            title="Undo (Ctrl/Cmd+Z)"
            aria-label="Undo"
            onClick={() => undo()}>
            <Undo2 />
          </Button>
          <Button
            icon
            variant="ghost"
            disabled={!canRedo}
            title="Redo (Ctrl/Cmd+Shift+Z)"
            aria-label="Redo"
            onClick={() => redo()}>
            <Redo2 />
          </Button>
        </div>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Eye className="size-4" strokeWidth={1.5} />}
        title="Preview (Ctrl/Cmd+P)"
        onClick={() => setPreviewOpen(true)}>
        Preview
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<History className="size-4" strokeWidth={1.5} />}
        onClick={() => setRevisionsOpen(true)}>
        History
      </Button>
      {canEdit ? (
        <>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="size-4" strokeWidth={1.5} />}
            onClick={() => setExportOpen(true)}>
            Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isSaving}
            title="Create a revision snapshot (Ctrl/Cmd+S)"
            onClick={() => void handleSaveRevision()}>
            Save
          </Button>
        </>
      ) : null}
      {canEdit ? (
        <RenameTemplateModal
          open={renameOpen}
          onOpenChange={setRenameOpen}
          templateId={templateId}
          currentName={name}
          expectedUpdatedAt={updatedAt}
          onRenamed={applyRename}
        />
      ) : null}
    </div>
  );
}
