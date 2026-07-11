"use client";

import { useMemo, useState } from "react";
import type { WorkspaceRole } from "@repo/shared";
import { Button } from "@repo/ui/client";
import { AssignOrgMemberModal } from "@/components/members/assign-org-member-modal";
import { InviteMemberModal } from "@/components/members/invite-member-modal";
import {
  MemberList,
  type MemberListItem,
} from "@/components/members/member-list";
import { PendingInvitesList } from "@/components/members/pending-invites-list";
import { ConfirmModal } from "@/components/template-builder/modals/confirm-modal";
import { WORKSPACE_MEMBER_ROLE_OPTIONS } from "@/lib/members/member-role-options";
import { useOrganizationMembers } from "@/lib/org/org-hooks";
import {
  useInviteWorkspaceMember,
  useRemoveWorkspaceMember,
  useResendWorkspaceInvite,
  useRevokeWorkspaceInvite,
  useUpdateWorkspaceMemberRole,
  useWorkspaceInvites,
  useWorkspaceMembers,
} from "@/lib/workspaces/workspace-member-hooks";
import { showToast } from "@/stores/toast-store";
import { useToastMutation } from "@/lib/use-toast-mutation";

type WorkspaceMembersSectionProps = {
  workspaceId: string;
  organizationId: string;
  canManage: boolean;
};

export function WorkspaceMembersSection({
  workspaceId,
  organizationId,
  canManage,
}: WorkspaceMembersSectionProps) {
  const membersQuery = useWorkspaceMembers(workspaceId);
  const invitesQuery = useWorkspaceInvites(workspaceId, canManage);
  const orgMembersQuery = useOrganizationMembers(organizationId);
  const inviteMember = useInviteWorkspaceMember(workspaceId);
  const updateRole = useUpdateWorkspaceMemberRole(workspaceId);
  const removeMember = useRemoveWorkspaceMember(workspaceId);
  const resendInvite = useResendWorkspaceInvite(workspaceId);
  const revokeInvite = useRevokeWorkspaceInvite(workspaceId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<MemberListItem | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);

  const members = useMemo(
    () =>
      (membersQuery.data ?? []).map((member) => ({
        userId: member.userId,
        name: member.name,
        email: member.email,
        role: member.role,
      })),
    [membersQuery.data],
  );

  const assignCandidates = useMemo(() => {
    const workspaceUserIds = new Set(members.map((member) => member.userId));

    return (orgMembersQuery.data ?? [])
      .filter((member) => !workspaceUserIds.has(member.userId))
      .map((member) => ({
        userId: member.userId,
        name: member.name,
        email: member.email,
        role: member.role,
      }));
  }, [members, orgMembersQuery.data]);

  const invite = useToastMutation({
    mutationFn: (input: { email: string; role: string }) =>
      inviteMember.mutateAsync({
        email: input.email,
        role: input.role as Exclude<WorkspaceRole, "owner">,
      }),
    errorMessage: "Could not send invite",
    onSuccess: (result) => {
      setInviteOpen(false);
      showToast(
        result.status === "pending_invite" ? "Invite sent" : "Member added",
      );
    },
  });

  const assign = useToastMutation({
    mutationFn: (input: { email: string; role: string }) =>
      inviteMember.mutateAsync({
        email: input.email,
        role: input.role as Exclude<WorkspaceRole, "owner">,
      }),
    errorMessage: "Could not add member",
    onSuccess: (result) => {
      setAssignOpen(false);
      showToast(
        result.status === "pending_invite"
          ? "Invite sent"
          : "Member added to workspace",
      );
    },
  });

  const remove = useToastMutation({
    mutationFn: (userId: string) => removeMember.mutateAsync(userId),
    successMessage: "Member removed",
    errorMessage: "Could not remove member",
    onSuccess: () => setRemoveTarget(null),
  });

  const resend = useToastMutation({
    mutationFn: async (inviteId: string) => {
      setPendingInviteId(inviteId);
      try {
        return await resendInvite.mutateAsync(inviteId);
      } finally {
        setPendingInviteId(null);
      }
    },
    successMessage: "Invite resent",
    errorMessage: "Could not resend invite",
  });

  const revoke = useToastMutation({
    mutationFn: async (inviteId: string) => {
      setPendingInviteId(inviteId);
      try {
        return await revokeInvite.mutateAsync(inviteId);
      } finally {
        setPendingInviteId(null);
      }
    },
    successMessage: "Invite revoked",
    errorMessage: "Could not revoke invite",
  });

  async function handleRoleChange(userId: string, role: string) {
    setPendingUserId(userId);

    try {
      await updateRole.mutateAsync({
        userId,
        role: role as Exclude<WorkspaceRole, "owner">,
      });
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-ui-lg font-medium text-text-primary">Members</h2>
            <p className="mt-1 text-ui-sm text-text-secondary">
              People who can access this workspace.
            </p>
          </div>
          {canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setAssignOpen(true)}>
                Add org member
              </Button>
              <Button variant="primary" onClick={() => setInviteOpen(true)}>
                Invite by email
              </Button>
            </div>
          ) : null}
        </div>

        {membersQuery.isLoading ? (
          <p className="text-ui-sm text-text-secondary">Loading members...</p>
        ) : (
          <MemberList
            members={members}
            canManage={canManage}
            protectedRole="owner"
            roleOptions={WORKSPACE_MEMBER_ROLE_OPTIONS}
            pendingUserId={pendingUserId}
            onRoleChange={handleRoleChange}
            onRemove={setRemoveTarget}
          />
        )}
      </div>

      {canManage ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-ui-md font-medium text-text-primary">
              Pending invites
            </h3>
            <p className="mt-1 text-ui-sm text-text-secondary">
              Invites waiting for someone without an account to accept.
            </p>
          </div>
          {invitesQuery.isLoading ? (
            <p className="text-ui-sm text-text-secondary">Loading invites...</p>
          ) : (
            <PendingInvitesList
              invites={invitesQuery.data ?? []}
              canManage={canManage}
              pendingInviteId={pendingInviteId}
              onResend={(inviteId) => resend.mutate(inviteId)}
              onRevoke={(inviteId) => revoke.mutate(inviteId)}
            />
          )}
        </div>
      ) : null}

      <InviteMemberModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite workspace member"
        description="Add someone by email. They will join the organization if needed."
        roleOptions={WORKSPACE_MEMBER_ROLE_OPTIONS}
        defaultRole="member"
        isPending={invite.isPending}
        onInvite={(input) => invite.mutate(input)}
      />

      <AssignOrgMemberModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        candidates={assignCandidates}
        roleOptions={WORKSPACE_MEMBER_ROLE_OPTIONS}
        defaultRole="member"
        isPending={assign.isPending}
        onAssign={(input) => assign.mutate(input)}
      />

      <ConfirmModal
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveTarget(null);
          }
        }}
        title="Remove member"
        description={
          removeTarget
            ? `Remove ${removeTarget.name} from this workspace?`
            : undefined
        }
        confirmLabel="Remove member"
        variant="danger"
        isPending={remove.isPending}
        onConfirm={() => {
          if (removeTarget) {
            remove.mutate(removeTarget.userId);
          }
        }}
      />
    </section>
  );
}
