"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { useUpdateContact } from "@/lib/contacts/contact-hooks";
import { useContact } from "@/lib/contacts/contact-hooks";
import { ContactStatusBadge } from "@/components/contacts/contact-status-badge";

type ContactDetailViewProps = {
  contactId: string;
};

export function ContactDetailView({ contactId }: ContactDetailViewProps) {
  const { workspace } = useWorkspace();
  const canEdit = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const contactQuery = useContact(contactId);
  const updateContact = useUpdateContact(contactId);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (contactQuery.data) {
      setFirstName(contactQuery.data.firstName ?? "");
      setLastName(contactQuery.data.lastName ?? "");
    }
  }, [contactQuery.data]);

  if (contactQuery.isLoading) {
    return <p className="p-8 text-ui-sm text-text-secondary">Loading…</p>;
  }

  if (contactQuery.error || !contactQuery.data) {
    throw contactQuery.error ?? new Error("Contact not found");
  }

  const contact = contactQuery.data;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={`/${workspace.slug}/contacts`}
        className="text-ui-sm text-text-secondary hover:underline"
      >
        ← All contacts
      </Link>

      <div className="mt-4 space-y-6">
        <div>
          <h1 className="text-ui-2xl font-semibold text-text-primary">{contact.email}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {contact.suppressedAt ? (
              <ContactStatusBadge suppressed />
            ) : null}
            {contact.globalUnsubscribedAt ? (
              <ContactStatusBadge globallyUnsubscribed />
            ) : null}
          </div>
        </div>

        {canEdit ? (
          <section className="rounded-2xl border border-border-default bg-surface-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-ui-xs text-text-secondary">First name</span>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-ui-xs text-text-secondary">Last name</span>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                disabled={updateContact.isPending}
                onClick={() =>
                  updateContact.mutate({
                    firstName: firstName || null,
                    lastName: lastName || null,
                  })
                }
              >
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  updateContact.mutate({
                    globalUnsubscribed: !contact.globalUnsubscribedAt,
                  })
                }
              >
                {contact.globalUnsubscribedAt ? "Clear global unsub" : "Global unsubscribe"}
              </Button>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-border-default bg-surface-card p-6">
          <h2 className="text-ui-lg font-medium text-text-primary">List memberships</h2>
          {contact.listMemberships.length === 0 ? (
            <p className="mt-2 text-ui-sm text-text-secondary">Not on any lists.</p>
          ) : (
            <ul className="mt-3 space-y-2">
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
        </section>
      </div>
    </div>
  );
}
