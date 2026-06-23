"use client";

import { Button, Input } from "@repo/ui/client";
import { useCreateContact } from "@/lib/contacts/contact-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";

type CreateContactModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateContactModal({ open, onOpenChange }: CreateContactModalProps) {
  const createContact = useCreateContact();
  const create = useToastMutation({
    mutationFn: (input: Parameters<typeof createContact.mutateAsync>[0]) =>
      createContact.mutateAsync(input),
    successMessage: "Contact created",
    errorMessage: "Could not create contact",
    onSuccess: () => onOpenChange(false),
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
          const form = event.currentTarget;
          const email = (form.elements.namedItem("email") as HTMLInputElement).value;
          const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value;
          const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value;
          create.mutate({
            email,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          });
        }}
      >
        <h2 className="text-ui-lg font-semibold text-text-primary">Add contact</h2>
        <div className="mt-4 space-y-3">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="firstName" placeholder="First name" />
          <Input name="lastName" placeholder="Last name" />
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
