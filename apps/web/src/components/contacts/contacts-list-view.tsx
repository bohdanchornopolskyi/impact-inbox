"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, EmptyState, PageHeader, Search, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { isTemplateAccessMode } from "@/lib/org/template-access-mode";
import { useContacts } from "@/lib/contacts/contact-hooks";
import { FeatureLock } from "@/components/contacts/feature-lock";
import { CreateContactModal } from "@/components/contacts/modals/create-contact-modal";
import { WorkspacePageShell } from "@/components/app/workspace-page-chrome";

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
    <WorkspacePageShell>
      <PageHeader
        className="mb-5"
        title="Contacts"
        description="Manage people in this workspace."
        actions={
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
        }
      />

      <FeatureLock locked={locked} orgId={workspace.organizationId}>
        <div className="mb-4 max-w-xs">
          <Search
            placeholder="Search contacts"
            aria-label="Search contacts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {contactsQuery.isPending ? (
          <Skeleton />
        ) : contacts.length === 0 ? (
          <EmptyState
            title="No contacts yet"
            description="Add people to this workspace to send campaigns."
            action={
              canEdit && !locked ? (
                <Button variant="primary" onClick={() => setCreateOpen(true)}>
                  Add contact
                </Button>
              ) : null
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow interactive={false} className="h-10">
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link
                      href={`/${workspace.slug}/contacts/${contact.id}`}
                      className="font-medium text-text"
                    >
                      {contact.email}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </FeatureLock>

      <CreateContactModal open={createOpen} onOpenChange={setCreateOpen} />
    </WorkspacePageShell>
  );
}
