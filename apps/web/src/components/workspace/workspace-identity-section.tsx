"use client";

import { Card, CardBody, CardDescription, CardHeader, CardTitle, Input } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";

export function WorkspaceIdentitySection() {
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace details</CardTitle>
        <CardDescription>
          The slug appears in workspace URLs. Old links keep redirecting after a
          change.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="name"
            label="Name"
            defaultValue={workspace.name}
            disabled={!canManage}
            placeholder="Acme Marketing"
          />
          <Input
            name="slug"
            label="Slug"
            defaultValue={workspace.slug}
            disabled={!canManage}
            placeholder="acme-marketing"
            mono
          />
        </div>
      </CardBody>
    </Card>
  );
}
