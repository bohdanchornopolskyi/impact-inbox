"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  useContactList,
  useListMembers,
  useUpdateContactList,
} from "@/lib/contacts/contact-hooks";
import { ContactStatusBadge } from "@/components/contacts/contact-status-badge";
import { ImportWizardModal } from "@/components/contacts/import/import-wizard-modal";
import {
  WorkspacePageHeader,
  WorkspacePageShell,
} from "@/components/app/workspace-page-chrome";

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
    return <p className="p-8 text-ui-sm text-text-secondary">Loading…</p>;
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

      <WorkspacePageHeader
        className="mt-4"
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

      <div className="overflow-hidden rounded-2xl border border-border-default">
        <table className="min-w-full divide-y divide-border-default text-ui-sm">
          <thead className="bg-surface-inset">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default bg-surface-card">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/${workspace.slug}/contacts/${member.contactId}`}
                    className="font-medium text-text-primary hover:underline"
                  >
                    {member.email}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <ContactStatusBadge
                    status={member.status}
                    suppressed={Boolean(member.suppressedAt)}
                    globallyUnsubscribed={Boolean(member.globalUnsubscribedAt)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ImportWizardModal
        listId={listId}
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </WorkspacePageShell>
  );
}
