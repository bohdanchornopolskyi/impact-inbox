"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input, Modal } from "@repo/ui/client";
import { useCreateWorkspace } from "@/lib/org/org-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";

type CreateWorkspaceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
};

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  organizationId,
}: CreateWorkspaceModalProps) {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
    }
  }, [open]);

  const create = useToastMutation({
    mutationFn: () =>
      createWorkspace.mutateAsync({
        organizationId,
        name: name.trim(),
        slug: slug.trim() || undefined,
      }),
    successMessage: "Workspace created",
    errorMessage: "Could not create workspace",
    onSuccess: (workspace) => {
      onOpenChange(false);
      router.push(`/${workspace.slug}`);
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    create.mutate();
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create workspace"
      description="Add a new workspace for a client or team."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-workspace-form"
            variant="primary"
            disabled={!name.trim() || create.isPending}
          >
            Create workspace
          </Button>
        </>
      }
    >
      <form id="create-workspace-form" onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme Marketing"
          autoFocus
        />
        <Input
          label="Slug (optional)"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="acme-marketing"
          mono
        />
      </form>
    </Modal>
  );
}
