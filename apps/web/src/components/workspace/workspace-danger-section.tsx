"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Modal } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { resolveDefaultAppPath } from "@/lib/app-navigation";
import { listWorkspaces } from "@/lib/api/workspaces-api";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { useDeleteWorkspace } from "@/lib/workspaces/workspace-hooks";

export function WorkspaceDangerSection() {
  const router = useRouter();
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const canDelete = hasWorkspaceRoleAtLeast(workspace.role, ["owner"]);
  const [open, setOpen] = useState(false);
  const deleteWorkspace = useDeleteWorkspace();
  const remove = useToastMutation({
    mutationFn: () => deleteWorkspace.mutateAsync(workspace.id),
    successMessage: "Workspace deleted",
    errorMessage: "Could not delete workspace",
    onSuccess: async () => {
      const workspaces = await listWorkspaces(token);
      router.replace(resolveDefaultAppPath(workspaces) ?? "/");
    },
  });

  if (!canDelete) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-danger-200 bg-surface px-6 py-[18px]">
        <div className="flex min-w-0 flex-col gap-[3px]">
          <p className="text-sm font-semibold text-text">Delete this workspace</p>
          <p className="text-xs text-text-2">
            Removes all templates, contacts and campaign history. This cannot be
            undone.
          </p>
        </div>
        <Button
          type="button"
          variant="danger"
          className="h-9 shrink-0 rounded-md"
          leftIcon={<Trash2 strokeWidth={1.5} />}
          onClick={() => setOpen(true)}
        >
          Delete workspace
        </Button>
      </div>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Delete this workspace?"
        description="All templates, contacts and campaign history will be removed. This cannot be undone."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={remove.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={remove.isPending}
              onClick={() => {
                void remove.mutateAsync();
              }}
            >
              Delete workspace
            </Button>
          </>
        }
      />
    </>
  );
}
