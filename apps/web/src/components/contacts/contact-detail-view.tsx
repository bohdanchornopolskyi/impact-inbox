"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardBody, CardHeader, CardTitle, Input, PageHeader } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast, type ContactDetailData } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { useContact, useUpdateContact } from "@/lib/contacts/contact-hooks";
import { ContactStatusBadge } from "@/components/contacts/contact-status-badge";
import { WorkspacePageShell } from "@/components/app/workspace-page-chrome";
import {
  contactNameUpdate,
  resolveContactNameFields,
  type ContactNameFields,
} from "@/components/contacts/contact-name-draft";
import { showToast } from "@/stores/toast-store";
import { useToastMutation } from "@/lib/use-toast-mutation";

type ContactDetailViewProps = {
  contactId: string;
};

export function ContactDetailView({ contactId }: ContactDetailViewProps) {
  const { workspace } = useWorkspace();
  const canEdit = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const contactQuery = useContact(contactId);

  if (contactQuery.isLoading) {
    return <p className="p-8 text-ui-sm text-text-secondary">Loading…</p>;
  }

  if (contactQuery.error || !contactQuery.data) {
    throw contactQuery.error ?? new Error("Contact not found");
  }

  const contact = contactQuery.data;

  return (
    <WorkspacePageShell>
      <Link
        href={`/${workspace.slug}/contacts`}
        className="text-ui-sm text-text-secondary hover:underline"
      >
        ← All contacts
      </Link>

      <PageHeader
        className="mt-4 mb-5"
        title={contact.email}
        description={
          <div className="flex flex-wrap gap-2">
            {contact.suppressedAt ? <ContactStatusBadge suppressed /> : null}
            {contact.globalUnsubscribedAt ? (
              <ContactStatusBadge globallyUnsubscribed />
            ) : null}
          </div>
        }
      />

      <div className="space-y-6">
        {canEdit ? (
          <ContactIdentityEditor key={contact.id} contact={contact} />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>List memberships</CardTitle>
          </CardHeader>
          <CardBody>
            {contact.listMemberships.length === 0 ? (
              <p className="text-sm text-text-2">Not on any lists.</p>
            ) : (
              <ul className="space-y-2">
                {contact.listMemberships.map((membership) => (
                  <li
                    key={membership.listId}
                    className="flex items-center justify-between gap-3 text-ui-sm"
                  >
                    <Link
                      href={`/${workspace.slug}/contacts/lists/${membership.listId}`}
                      className="font-medium text-text-primary hover:underline"
                    >
                      {membership.listName}
                    </Link>
                    <ContactStatusBadge status={membership.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </WorkspacePageShell>
  );
}

function ContactIdentityEditor({ contact }: { contact: ContactDetailData }) {
  const updateContact = useUpdateContact(contact.id);
  const [nameDraft, setNameDraft] = useState<ContactNameFields | null>(null);
  const fields = resolveContactNameFields(contact, nameDraft);
  const saveName = useToastMutation({
    mutationFn: (input: ReturnType<typeof contactNameUpdate>) =>
      updateContact.mutateAsync(input),
    successMessage: "Contact saved",
    errorMessage: "Could not save contact",
    onSuccess: () => {
      setNameDraft(null);
    },
  });
  const toggleUnsubscribe = useToastMutation({
    mutationFn: (globalUnsubscribed: boolean) =>
      updateContact.mutateAsync({ globalUnsubscribed }),
    errorMessage: "Could not update unsubscribe status",
    onSuccess: (_data, globalUnsubscribed) => {
      showToast(
        globalUnsubscribed
          ? "Contact globally unsubscribed"
          : "Global unsubscribe cleared",
      );
    },
  });
  const isUpdating = saveName.isPending || toggleUnsubscribe.isPending;

  function editName(patch: Partial<ContactNameFields>) {
    setNameDraft({ ...fields, ...patch });
  }

  return (
    <Card>
      <CardBody>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-ui-xs text-text-secondary">First name</span>
            <Input
              value={fields.firstName}
              disabled={saveName.isPending}
              onChange={(event) => editName({ firstName: event.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-ui-xs text-text-secondary">Last name</span>
            <Input
              value={fields.lastName}
              disabled={saveName.isPending}
              onChange={(event) => editName({ lastName: event.target.value })}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            disabled={isUpdating}
            onClick={() => saveName.mutate(contactNameUpdate(fields))}
          >
            Save
          </Button>
          <Button
            variant="secondary"
            disabled={isUpdating}
            onClick={() =>
              toggleUnsubscribe.mutate(!contact.globalUnsubscribedAt)
            }
          >
            {contact.globalUnsubscribedAt
              ? "Clear global unsub"
              : "Global unsubscribe"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
