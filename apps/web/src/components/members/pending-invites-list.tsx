"use client";

import type { InviteData } from "@repo/shared";
import { Button } from "@repo/ui/client";
import { formatRoleLabel } from "@/lib/members/format-role-label";

type PendingInvitesListProps = {
  invites: InviteData[];
  canManage: boolean;
  pendingInviteId: string | null;
  onResend: (inviteId: string) => void;
  onRevoke: (inviteId: string) => void;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function inviteRoleLabel(invite: InviteData): string {
  if (invite.workspaceRole) {
    return `${formatRoleLabel(invite.organizationRole)} · workspace ${formatRoleLabel(invite.workspaceRole)}`;
  }

  return formatRoleLabel(invite.organizationRole);
}

export function PendingInvitesList({
  invites,
  canManage,
  pendingInviteId,
  onResend,
  onRevoke,
}: PendingInvitesListProps) {
  if (invites.length === 0) {
    return (
      <p className="text-ui-sm text-text-secondary">No pending invites.</p>
    );
  }

  return (
    <ul className="divide-y divide-border-default rounded-xl border border-border-default">
      {invites.map((invite) => {
        const isBusy = pendingInviteId === invite.id;

        return (
          <li
            key={invite.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-ui-sm font-medium text-text-primary">
                {invite.email}
              </p>
              <p className="mt-0.5 text-ui-xs text-text-secondary">
                {inviteRoleLabel(invite)}
              </p>
              <p className="mt-0.5 text-ui-xs text-text-secondary">
                {invite.expired ? "Expired" : "Pending"} · sent{" "}
                {formatDate(new Date(invite.createdAt))} · expires{" "}
                {formatDate(new Date(invite.expiresAt))}
              </p>
            </div>
            {canManage ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => onResend(invite.id)}
                >
                  Resend
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => onRevoke(invite.id)}
                >
                  Revoke
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
