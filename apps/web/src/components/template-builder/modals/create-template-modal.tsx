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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setError("");
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Enter a template name.");
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
            loading={create.isPending}
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
          error={error}
          onChange={(event) => {
            setName(event.target.value);
            if (error) {
              setError("");
            }
          }}
          placeholder="Welcome email"
          autoFocus
        />
      </form>
    </Modal>
  );
}
