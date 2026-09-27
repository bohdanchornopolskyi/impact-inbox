"use client";

import type { ReactNode } from "react";
import {
  CopyPlus,
  Download,
  Eye,
  History,
  LayoutTemplate,
  MailCheck,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import {
  Button,
  EditorBarDivider,
  SplitButton,
  type SplitButtonItem,
} from "@repo/ui/client";
import { BuilderIssuesButton } from "./builder-issues-button";
import { useBuilder, useSaveRevision } from "./builder-provider";
import { builderShortcutLabel } from "./builder-shortcut";

function HistoryButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      icon
      variant="ghost"
      className="size-[30px]"
      disabled={disabled}
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function BuilderToolbarActions() {
  const canEdit = useBuilder((s) => s.canEdit);
  const canUndo = useBuilder((s) => s.history.past.length > 0);
  const canRedo = useBuilder((s) => s.history.future.length > 0);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const setPreviewOpen = useBuilder((s) => s.setPreviewOpen);
  const setRevisionsOpen = useBuilder((s) => s.setRevisionsOpen);
  const setExportOpen = useBuilder((s) => s.setExportOpen);
  const saveState = useBuilder((s) => s.saveState);
  const { saveRevision } = useSaveRevision();
  const isSaving = saveState === "saving";

  const saveItems: SplitButtonItem[] = [
    {
      label: "Save version…",
      shortcut: builderShortcutLabel("save"),
      icon: <Save strokeWidth={1.5} />,
      onSelect: () => {
        void saveRevision();
      },
    },
    {
      label: "Duplicate template",
      icon: <CopyPlus strokeWidth={1.5} />,
      disabled: true,
      onSelect: () => undefined,
    },
    {
      label: "Save as new template",
      icon: <LayoutTemplate strokeWidth={1.5} />,
      disabled: true,
      onSelect: () => undefined,
    },
    {
      label: "Export HTML",
      icon: <Download strokeWidth={1.5} />,
      onSelect: () => setExportOpen(true),
    },
    {
      label: "Version history",
      icon: <History strokeWidth={1.5} />,
      separatorBefore: true,
      onSelect: () => setRevisionsOpen(true),
    },
  ];

  return (
    <>
      {canEdit ? (
        <div className="flex items-center gap-0.5">
          <HistoryButton
            label="Undo (Ctrl/Cmd+Z)"
            disabled={!canUndo}
            onClick={() => undo()}
          >
            <Undo2 />
          </HistoryButton>
          <HistoryButton
            label="Redo (Ctrl/Cmd+Shift+Z)"
            disabled={!canRedo}
            onClick={() => redo()}
          >
            <Redo2 />
          </HistoryButton>
          <HistoryButton
            label="Version history"
            onClick={() => setRevisionsOpen(true)}
          >
            <History />
          </HistoryButton>
        </div>
      ) : (
        <HistoryButton
          label="Version history"
          onClick={() => setRevisionsOpen(true)}
        >
          <History />
        </HistoryButton>
      )}
      <EditorBarDivider />
      <BuilderIssuesButton />
      <Button
        variant="secondary"
        leftIcon={<Eye strokeWidth={1.5} />}
        title="Preview (Ctrl/Cmd+P)"
        onClick={() => setPreviewOpen(true)}
      >
        Preview as…
      </Button>
      {canEdit ? (
        <>
          <Button
            variant="secondary"
            leftIcon={<MailCheck strokeWidth={1.5} />}
            disabled
            title="Test send isn't available yet"
          >
            Test send
          </Button>
          <SplitButton
            disabled={isSaving}
            title="Create a revision snapshot (Ctrl/Cmd+S)"
            items={saveItems}
            onClick={() => {
              void saveRevision();
            }}
          >
            Save version
          </SplitButton>
        </>
      ) : null}
    </>
  );
}
