"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { isTemplateAccessMode } from "@/lib/org/template-access-mode";
import { useContactLists } from "@/lib/contacts/contact-hooks";
import { FeatureLock } from "@/components/contacts/feature-lock";
import { CreateListModal } from "@/components/contacts/modals/create-list-modal";
import {
  WorkspacePageHeader,
  WorkspacePageShell,
} from "@/components/app/workspace-page-chrome";

export function ContactListsView() {
  const { workspace } = useWorkspace();
  const { organizations } = useSession();
  const organization = organizations.find((o) => o.id === workspace.organizationId);
  const locked = organization ? isTemplateAccessMode(organization) : false;
  const canEdit = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const listsQuery = useContactLists();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <WorkspacePageShell>
      <Link
        href={`/${workspace.slug}/contacts`}
        className="mb-2 inline-block text-ui-sm text-text-secondary hover:underline"
      >
        ← Contacts
      </Link>
      <WorkspacePageHeader
        title="Lists"
        description="Group contacts for campaigns and imports."
        actions={
          canEdit && !locked ? (
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              New list
            </Button>
          ) : null
        }
      />

      <FeatureLock locked={locked} orgId={workspace.organizationId}>
        {listsQuery.isLoading ? (
          <p className="text-ui-sm text-text-secondary">Loading lists…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(listsQuery.data ?? []).map((list) => (
              <Card key={list.id} className="p-5">
                <Link
                  href={`/${workspace.slug}/contacts/lists/${list.id}`}
                  className="text-ui-lg font-medium text-text-primary hover:underline"
                >
                  {list.name}
                </Link>
                <p className="mt-2 text-ui-sm text-text-secondary">
                  {list.memberCount} members
                  {list.doubleOptInEnabled ? " · double opt-in" : ""}
                </p>
              </Card>
            ))}
          </div>
        )}
      </FeatureLock>

      <CreateListModal open={createOpen} onOpenChange={setCreateOpen} />
    </WorkspacePageShell>
  );
}
