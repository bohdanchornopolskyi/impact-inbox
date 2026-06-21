"use client";

import { useUpdateTemplate } from "@/lib/templates/template-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { ConfirmModal } from "./confirm-modal";

type RestoreTemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
  onRestored?: () => void;
};

export function RestoreTemplateModal({
  open,
  onOpenChange,
  templateId,
  templateName,
  onRestored,
}: RestoreTemplateModalProps) {
  const updateTemplate = useUpdateTemplate(templateId);
  const { mutateAsync, isPending } = useToastMutation({
    mutationFn: () => updateTemplate.mutateAsync({ archived: false }),
    successMessage: "Template restored",
    errorMessage: "Could not restore template",
    onSuccess: () => {
      onOpenChange(false);
      onRestored?.();
    },
  });

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Restore template"
      description={`Restore "${templateName}" to the active list?`}
      confirmLabel="Restore template"
      variant="primary"
      isPending={isPending}
      onConfirm={() => void mutateAsync()}
    >
      <p className="text-ui-sm text-text-secondary">
        Working copy and revision history are unchanged.
      </p>
    </ConfirmModal>
  );
}
