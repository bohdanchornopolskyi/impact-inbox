"use client";

import { useRestoreRevision } from "../builder-provider";
import { ConfirmModal } from "./confirm-modal";

type RestoreRevisionModalProps = {
  revisionId: string;
  onClose: () => void;
};

export function RestoreRevisionModal({
  revisionId,
  onClose,
}: RestoreRevisionModalProps) {
  const { restore, isPending } = useRestoreRevision();

  async function handleRestore() {
    const restored = await restore(revisionId);
    if (restored) {
      onClose();
    }
  }

  return (
    <ConfirmModal
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title="Restore revision"
      description="The current working copy will be snapshotted to history before this revision is applied."
      confirmLabel="Restore revision"
      variant="primary"
      isPending={isPending}
      onConfirm={() => void handleRestore()}
    >
      <p className="text-ui-sm text-text-secondary">
        Nothing is removed from revision history.
      </p>
    </ConfirmModal>
  );
}
