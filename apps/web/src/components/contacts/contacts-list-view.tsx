"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Input } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { isTemplateAccessMode } from "@/lib/org/template-access-mode";
import { useContacts } from "@/lib/contacts/contact-hooks";
import { FeatureLock } from "@/components/contacts/feature-lock";
import { CreateContactModal } from "@/components/contacts/modals/create-contact-modal";

export function ContactsListView() {
  const { workspace } = useWorkspace();
  const { organizations } = useSession();
  const organization = organizations.find((o) => o.id === workspace.organizationId);
  const locked = organization ? isTemplateAccessMode(organization) : false;
  const canEdit = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const contactsQuery = useContacts({ search: search.trim() || undefined });

  const contacts = contactsQuery.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ui-2xl font-semibold text-text-primary">Contacts</h1>
          <p className="mt-1 text-ui-sm text-text-secondary">
            Manage people in this workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${workspace.slug}/contacts/lists`}
            className="inline-flex items-center rounded-lg border border-border-default px-3 py-2 text-ui-sm font-medium text-text-primary"
          >
            Lists
          </Link>
          {canEdit && !locked ? (
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              Add contact
            </Button>
          ) : null}
        </div>
      </div>

      <FeatureLock locked={locked} orgId={workspace.organizationId}>
        <div className="mb-4 max-w-xs">
          <Input
            placeholder="Search contacts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {contactsQuery.isPending ? (
          <p className="text-ui-sm text-text-secondary">Loading contacts…</p>
        ) : contacts.length === 0 ? (
          <p className="text-ui-sm text-text-secondary">No contacts yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border-default">
            <table className="min-w-full divide-y divide-border-default text-ui-sm">
              <thead className="bg-surface-inset">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default bg-surface-card">
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${workspace.slug}/contacts/${contact.id}`}
                        className="font-medium text-text-primary hover:underline"
                      >
                        {contact.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FeatureLock>

      <CreateContactModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
