"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CopyPlus,
  Download,
  Eye,
  History,
  LayoutTemplate,
  MailCheck,
  Redo2,
  Send,
  Undo2,
} from "lucide-react";
import {
  Button,
  EditorBarDivider,
  SplitButton,
  type SplitButtonItem,
} from "@repo/ui/client";
import { useWorkspace } from "@/contexts/workspace-context";
import { useBuilder, useSaveRevision } from "./builder-provider";

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
  const router = useRouter();
  const { workspace } = useWorkspace();
  const canEdit = useBuilder((s) => s.canEdit);
  const canUndo = useBuilder((s) => s.history.past.length > 0);
  const canRedo = useBuilder((s) => s.history.future.length > 0);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const setPreviewOpen = useBuilder((s) => s.setPreviewOpen);
  const setRevisionsOpen = useBuilder((s) => s.setRevisionsOpen);
  const setExportOpen = useBuilder((s) => s.setExportOpen);
  const { saveRevision, isPending: isSaving } = useSaveRevision();

  const saveItems: SplitButtonItem[] = [
    {
      label: "Save and close",
      shortcut: "⌘⇧S",
      icon: <Check strokeWidth={1.5} />,
      onSelect: () => {
        void saveRevision().then((saved) => {
          if (saved) {
            router.push(`/${workspace.slug}/templates`);
          }
        });
      },
    },
    {
      label: "Save as copy",
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
      label: "Save and send test",
      icon: <Send strokeWidth={1.5} />,
      disabled: true,
      onSelect: () => undefined,
      separatorBefore: true,
    },
    {
      label: "Version history",
      icon: <History strokeWidth={1.5} />,
      onSelect: () => setRevisionsOpen(true),
    },
    {
      label: "Discard changes",
      icon: <Undo2 strokeWidth={1.5} />,
      disabled: true,
      onSelect: () => undefined,
      destructive: true,
      separatorBefore: true,
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
      <Button
        variant="secondary"
        leftIcon={<Eye strokeWidth={1.5} />}
        title="Preview (Ctrl/Cmd+P)"
        onClick={() => setPreviewOpen(true)}
      >
        Preview
      </Button>
      {canEdit ? (
        <>
          <Button
            variant="secondary"
            leftIcon={<MailCheck strokeWidth={1.5} />}
            title="Test send isn't available yet"
            disabled
          >
            Test send
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Download strokeWidth={1.5} />}
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
          <SplitButton
            disabled={isSaving}
            title="Create a revision snapshot (Ctrl/Cmd+S)"
            items={saveItems}
            onClick={() => {
              void saveRevision();
            }}
          >
            Save
          </SplitButton>
        </>
      ) : null}
    </>
  );
}
