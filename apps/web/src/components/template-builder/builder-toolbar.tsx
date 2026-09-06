"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Eye,
  History,
  Monitor,
  Redo2,
  Smartphone,
  Undo2,
  Upload,
} from "lucide-react";
import { Button, SaveStatus, SegmentedControl, ZoomControl } from "@repo/ui/client";
import { formatDistanceToNow } from "date-fns";
import { parseApiDate } from "@/lib/format-date";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  useBuilder,
  useBuilderFlush,
  useSaveRevision,
} from "./builder-provider";
import { InlineTemplateName } from "./inline-template-name";
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
  const canEdit = useBuilder((s) => s.canEdit);
  const saveState = useBuilder((s) => s.saveState);
  const canUndo = useBuilder((s) => s.history.past.length > 0);
  const canRedo = useBuilder((s) => s.history.future.length > 0);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const setPreviewOpen = useBuilder((s) => s.setPreviewOpen);
  const setRevisionsOpen = useBuilder((s) => s.setRevisionsOpen);
  const setExportOpen = useBuilder((s) => s.setExportOpen);
  const previewDevice = useBuilder((s) => s.previewDevice);
  const setPreviewDevice = useBuilder((s) => s.setPreviewDevice);
  const previewZoom = useBuilder((s) => s.previewZoom);
  const setPreviewZoom = useBuilder((s) => s.setPreviewZoom);
  const { saveRevision, isPending: isSaving } = useSaveRevision();

  async function handleSaveRevision() {
    await saveRevision();
  }

  return (
    <div className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-border bg-surface px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link
          href={`/${workspace.slug}/templates`}
          className="inline-flex h-7 items-center gap-1 rounded-sm px-2 text-sm font-medium text-text-2 hover:bg-surface-sunken hover:text-text"
          title={
            saveState === "unsaved"
              ? "Changes autosave — leaving keeps your template"
              : undefined
          }
        >
          <ChevronLeft className="size-3.75" strokeWidth={1.5} />
          Templates
        </Link>
        <div className="h-5 w-px bg-border" />
        <InlineTemplateName />
        <WorkingCopySyncStatus />
      </div>

      <div className="flex items-center gap-2">
        <SegmentedControl
          variant="device"
          value={previewDevice}
          onChange={(value) =>
            setPreviewDevice(value as "desktop" | "mobile")
          }
          options={[
            {
              value: "desktop",
              label: "Desktop",
              icon: <Monitor strokeWidth={1.5} />,
            },
            {
              value: "mobile",
              label: "Mobile",
              icon: <Smartphone strokeWidth={1.5} />,
            },
          ]}
        />
        <ZoomControl value={previewZoom} onChange={setPreviewZoom} />
      </div>

      <div className="flex items-center justify-end gap-2">
        {canEdit ? (
          <div className="flex items-center gap-0.5">
            <Button
              icon
              variant="ghost"
              className="size-[30px]"
              disabled={!canUndo}
              title="Undo (Ctrl/Cmd+Z)"
              aria-label="Undo"
              onClick={() => undo()}
            >
              <Undo2 />
            </Button>
            <Button
              icon
              variant="ghost"
              className="size-[30px]"
              disabled={!canRedo}
              title="Redo (Ctrl/Cmd+Shift+Z)"
              aria-label="Redo"
              onClick={() => redo()}
            >
              <Redo2 />
            </Button>
            <Button
              icon
              variant="ghost"
              className="size-[30px]"
              title="Version history"
              aria-label="Version history"
              onClick={() => setRevisionsOpen(true)}
            >
              <History />
            </Button>
          </div>
        ) : (
          <Button
            icon
            variant="ghost"
            className="size-[30px]"
            title="Version history"
            aria-label="Version history"
            onClick={() => setRevisionsOpen(true)}
          >
            <History />
          </Button>
        )}
        <div className="h-5 w-px bg-border" />
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Eye className="size-3.75" strokeWidth={1.5} />}
          title="Preview (Ctrl/Cmd+P)"
          onClick={() => setPreviewOpen(true)}
        >
          Preview
        </Button>
        {canEdit ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Upload className="size-3.75" strokeWidth={1.5} />}
              onClick={() => setExportOpen(true)}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSaving}
              title="Create a revision snapshot (Ctrl/Cmd+S)"
              onClick={() => void handleSaveRevision()}
            >
              Save
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
