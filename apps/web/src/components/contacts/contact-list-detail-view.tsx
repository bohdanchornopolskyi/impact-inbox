"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, EmptyState, PageHeader, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  useContactList,
  useListMembers,
  useUpdateContactList,
} from "@/lib/contacts/contact-hooks";
import { ContactStatusBadge } from "@/components/contacts/contact-status-badge";
import { ImportWizardModal } from "@/components/contacts/import/import-wizard-modal";
import { WorkspacePageShell } from "@/components/app/workspace-page-chrome";

type ContactListDetailViewProps = {
  listId: string;
};

export function ContactListDetailView({ listId }: ContactListDetailViewProps) {
  const { workspace } = useWorkspace();
  const canEdit = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const listQuery = useContactList(listId);
  const membersQuery = useListMembers(listId);
  const updateList = useUpdateContactList(listId);
  const [importOpen, setImportOpen] = useState(false);

  if (listQuery.isPending || membersQuery.isPending) {
    return (
      <WorkspacePageShell>
        <Skeleton />
      </WorkspacePageShell>
    );
  }

  if (!listQuery.data) {
    throw new Error("List not found");
  }

  const list = listQuery.data;
  const members = membersQuery.data ?? [];

  return (
    <WorkspacePageShell>
      <Link
        href={`/${workspace.slug}/contacts/lists`}
        className="text-ui-sm text-text-secondary hover:underline"
      >
        ← Lists
      </Link>

      <PageHeader
        className="mt-4 mb-5"
        title={list.name}
        description={`${list.memberCount} members`}
        actions={
          canEdit ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                Import CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  updateList.mutate({
                    doubleOptInEnabled: !list.doubleOptInEnabled,
                  })
                }
              >
                {list.doubleOptInEnabled ? "Disable" : "Enable"} double opt-in
              </Button>
            </div>
          ) : null
        }
      />

      {members.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Import a CSV or add contacts to this list."
          action={
            canEdit ? (
              <Button variant="primary" onClick={() => setImportOpen(true)}>
                Import CSV
              </Button>
            ) : null
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow interactive={false} className="h-10">
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Link
                    href={`/${workspace.slug}/contacts/${member.contactId}`}
                    className="font-medium text-text"
                  >
                    {member.email}
                  </Link>
                </TableCell>
                <TableCell>
                  <ContactStatusBadge
                    status={member.status}
                    suppressed={Boolean(member.suppressedAt)}
                    globallyUnsubscribed={Boolean(member.globalUnsubscribedAt)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ImportWizardModal
        listId={listId}
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </WorkspacePageShell>
  );
}
