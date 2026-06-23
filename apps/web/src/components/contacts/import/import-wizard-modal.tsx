"use client";

import { useState } from "react";
import { Button, Input } from "@repo/ui/client";
import {
  useContactImportJob,
  useExecuteContactImport,
  usePreviewContactImport,
} from "@/lib/contacts/contact-hooks";
import type { ImportPreviewResponseData } from "@repo/shared";

type ImportWizardModalProps = {
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportWizardModal({
  listId,
  open,
  onOpenChange,
}: ImportWizardModalProps) {
  const previewImport = usePreviewContactImport(listId);
  const executeImport = useExecuteContactImport();
  const [preview, setPreview] = useState<ImportPreviewResponseData | null>(null);
  const [emailColumn, setEmailColumn] = useState("");
  const [importId, setImportId] = useState<string | null>(null);
  const importJob = useContactImportJob(importId);

  if (!open) {
    return null;
  }

  const handleFile = async (file: File) => {
    const result = await previewImport.mutateAsync(file);
    setPreview(result);
    setEmailColumn(result.suggestedMapping.email);
    setImportId(null);
  };

  const handleExecute = async () => {
    if (!preview) return;
    const job = await executeImport.mutateAsync({
      importId: preview.importId,
      input: {
        columnMapping: {
          email: emailColumn,
          ...(preview.suggestedMapping.firstName
            ? { firstName: preview.suggestedMapping.firstName }
            : {}),
          ...(preview.suggestedMapping.lastName
            ? { lastName: preview.suggestedMapping.lastName }
            : {}),
        },
      },
    });
    setImportId(job.id);
  };

  const job = importJob.data;
  const done = job?.status === "completed" || job?.status === "failed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-default bg-surface-card p-6 shadow-lg">
        <h2 className="text-ui-lg font-semibold text-text-primary">Import CSV</h2>

        {!preview ? (
          <div className="mt-4">
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </div>
        ) : !importId ? (
          <div className="mt-4 space-y-3">
            <p className="text-ui-sm text-text-secondary">
              {preview.rowCount} rows detected
            </p>
            <label className="block space-y-1">
              <span className="text-ui-xs text-text-secondary">Email column</span>
              <Input value={emailColumn} onChange={(e) => setEmailColumn(e.target.value)} />
            </label>
            <Button variant="primary" onClick={() => void handleExecute()}>
              Import
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-2 text-ui-sm text-text-secondary">
            <p>Status: {job?.status ?? "processing"}</p>
            <p>
              Processed {job?.processedCount ?? 0} / {job?.rowCount ?? preview.rowCount}
            </p>
            {job?.errors.length ? (
              <p>{job.errors.length} row errors</p>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setPreview(null);
              setImportId(null);
              onOpenChange(false);
            }}
          >
            {done ? "Close" : "Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
}
