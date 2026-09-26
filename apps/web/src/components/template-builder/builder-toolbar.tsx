"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  DeviceToggle,
  EditorBar,
  EditorBarCenter,
  EditorBarDivider,
  EditorBarEnd,
  EditorBarStart,
  Logo,
  SaveStatus,
  ZoomControl,
} from "@repo/ui/client";
import { formatDistanceToNow } from "date-fns";
import { parseApiDate } from "@/lib/format-date";
import { AccountMenu } from "@/components/app/account-menu";
import { useWorkspace } from "@/contexts/workspace-context";
import { useBuilder, useBuilderFlush } from "./builder-provider";
import { BuilderToolbarActions } from "./builder-toolbar-actions";
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

function BuilderShortcutListener() {
  useBuilderShortcuts();
  return null;
}

function HomeLink() {
  const { workspace } = useWorkspace();

  return (
    <Link href={`/${workspace.slug}`} className="shrink-0" title="Home">
      <Logo compact showWordmark={false} />
    </Link>
  );
}

function TemplatesBackLink() {
  const { workspace } = useWorkspace();

  return (
    <Link
      href={`/${workspace.slug}/templates`}
      className="inline-flex h-7 items-center gap-1 rounded-sm px-2 text-sm font-medium text-text-2 hover:bg-surface-sunken hover:text-text"
      title="Changes autosave — leaving keeps your template"
    >
      <ChevronLeft className="size-3.75" strokeWidth={1.5} />
      Templates
    </Link>
  );
}

function BuilderPreviewControls() {
  const previewDevice = useBuilder((s) => s.previewDevice);
  const setPreviewDevice = useBuilder((s) => s.setPreviewDevice);
  const previewZoom = useBuilder((s) => s.previewZoom);
  const setPreviewZoom = useBuilder((s) => s.setPreviewZoom);

  return (
    <>
      <DeviceToggle value={previewDevice} onChange={setPreviewDevice} />
      <ZoomControl value={previewZoom} onChange={setPreviewZoom} />
    </>
  );
}

export function BuilderToolbar() {
  return (
    <EditorBar>
      <EditorBarStart>
        <BuilderShortcutListener />
        <HomeLink />
        <TemplatesBackLink />
        <EditorBarDivider />
        <InlineTemplateName />
        <WorkingCopySyncStatus />
      </EditorBarStart>
      <EditorBarCenter>
        <BuilderPreviewControls />
      </EditorBarCenter>
      <EditorBarEnd>
        <BuilderToolbarActions />
        <EditorBarDivider />
        <AccountMenu />
      </EditorBarEnd>
    </EditorBar>
  );
}
