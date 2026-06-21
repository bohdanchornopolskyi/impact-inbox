"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input, Modal } from "@repo/ui/client";
import { useWorkspace } from "@/contexts/workspace-context";
import { useCreateTemplate } from "@/lib/templates/template-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";

type CreateTemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateTemplateModal({
  open,
  onOpenChange,
}: CreateTemplateModalProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const createTemplate = useCreateTemplate();
  const create = useToastMutation({
    mutationFn: (nextName: string) =>
      createTemplate.mutateAsync({ name: nextName }),
    errorMessage: "Could not create template",
    onSuccess: (template) => {
      onOpenChange(false);
      router.push(`/${workspace.slug}/templates/${template.id}`);
    },
  });
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    create.mutate(name.trim());
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New template"
      description="Give your template a name. You can change it later."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-template-form"
            variant="primary"
            disabled={!name.trim() || create.isPending}
          >
            Create template
          </Button>
        </>
      }
    >
      <form id="create-template-form" onSubmit={handleSubmit} className="mt-4">
        <Input
          label="Template name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Welcome email"
          autoFocus
        />
      </form>
    </Modal>
  );
}
