"use client";

import { useUpdateTemplate } from "@/lib/templates/template-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { ConfirmModal } from "./confirm-modal";

type ArchiveTemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
  expectedUpdatedAt: string;
  onArchived?: () => void;
};

export function ArchiveTemplateModal({
  open,
  onOpenChange,
  templateId,
  templateName,
  expectedUpdatedAt,
  onArchived,
}: ArchiveTemplateModalProps) {
  const updateTemplate = useUpdateTemplate(templateId);
  const { mutateAsync, isPending } = useToastMutation({
    mutationFn: () =>
      updateTemplate.mutateAsync({ archived: true, expectedUpdatedAt }),
    successMessage: "Template archived",
    errorMessage: "Could not archive template",
    onSuccess: () => {
      onOpenChange(false);
      onArchived?.();
    },
  });

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Archive template"
      description={`Archive "${templateName}"? It will be hidden from pickers but kept with its revision history.`}
      confirmLabel="Archive template"
      variant="danger"
      isPending={isPending}
      onConfirm={() => void mutateAsync()}
    >
      <p className="text-ui-sm text-text-secondary">
        You can restore it from the archived list later.
      </p>
    </ConfirmModal>
  );
}
