"use client";

import { useEffect, useState } from "react";
import { Button, Input, Modal } from "@repo/ui/client";
import { useUpdateTemplate } from "@/lib/templates/template-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";

type RenameTemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  currentName: string;
  expectedUpdatedAt: string;
};

export function RenameTemplateModal({
  open,
  onOpenChange,
  templateId,
  currentName,
  expectedUpdatedAt,
}: RenameTemplateModalProps) {
  const updateTemplate = useUpdateTemplate(templateId);
  const rename = useToastMutation({
    mutationFn: (nextName: string) =>
      updateTemplate.mutateAsync({
        name: nextName,
        expectedUpdatedAt,
      }),
    successMessage: "Template renamed",
    errorMessage: "Could not rename template",
    onSuccess: () => onOpenChange(false),
  });
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || name.trim() === currentName) {
      onOpenChange(false);
      return;
    }

    rename.mutate(name.trim());
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Rename template"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="rename-template-form"
            variant="primary"
            disabled={!name.trim() || rename.isPending}
          >
            Save
          </Button>
        </>
      }
    >
      <form id="rename-template-form" onSubmit={handleSubmit} className="mt-4">
        <Input
          label="Template name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </form>
    </Modal>
  );
}
