"use client";

import { Button, Input } from "@repo/ui/client";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { useCreateContactList } from "@/lib/contacts/contact-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";

type CreateListModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateListModal({ open, onOpenChange }: CreateListModalProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const createContactList = useCreateContactList();
  const create = useToastMutation({
    mutationFn: (input: { name: string }) => createContactList.mutateAsync(input),
    successMessage: "List created",
    errorMessage: "Could not create list",
    onSuccess: (list) => {
      onOpenChange(false);
      router.push(`/${workspace.slug}/contacts/lists/${list.id}`);
    },
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="w-full max-w-md rounded-2xl border border-border-default bg-surface-card p-6 shadow-lg"
        onSubmit={(event) => {
          event.preventDefault();
          const name = (event.currentTarget.elements.namedItem("name") as HTMLInputElement)
            .value;
          create.mutate({ name });
        }}
      >
        <h2 className="text-ui-lg font-semibold text-text-primary">New list</h2>
        <div className="mt-4">
          <Input name="name" placeholder="List name" required />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={create.isPending}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
