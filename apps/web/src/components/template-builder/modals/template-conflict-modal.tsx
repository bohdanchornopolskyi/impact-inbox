"use client";

import { Button, Modal } from "@repo/ui/client";

type TemplateConflictModalProps = {
  open: boolean;
  onReload: () => void;
  isReloading?: boolean;
};

export function TemplateConflictModal({
  open,
  onReload,
  isReloading = false,
}: TemplateConflictModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={() => {}}
      title="Template changed elsewhere"
      footer={
        <Button variant="primary" disabled={isReloading} onClick={onReload}>
          {isReloading ? "Reloading…" : "Reload template"}
        </Button>
      }
    >
      <p className="mt-2 text-ui-sm text-text-secondary">
        Another session updated this template. Reload to get the latest working
        copy. Unsaved edits on this page will be lost.
      </p>
    </Modal>
  );
}
