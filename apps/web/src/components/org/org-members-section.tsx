"use client";

import { useMemo, useState } from "react";
import type { OrganizationRole } from "@repo/shared";
import { Button } from "@repo/ui/client";
import { InviteMemberModal } from "@/components/members/invite-member-modal";
import {
  MemberList,
  type MemberListItem,
} from "@/components/members/member-list";
import { PendingInvitesList } from "@/components/members/pending-invites-list";
import { ConfirmModal } from "@/components/template-builder/modals/confirm-modal";
import { ORG_MEMBER_ROLE_OPTIONS } from "@/lib/members/member-role-options";
import {
  useInviteOrganizationMember,
  useOrganizationInvites,
  useOrganizationMembers,
  useRemoveOrganizationMember,
  useResendOrganizationInvite,
  useRevokeOrganizationInvite,
  useUpdateOrganizationMemberRole,
} from "@/lib/org/org-hooks";
import { showToast } from "@/stores/toast-store";
import { useToastMutation } from "@/lib/use-toast-mutation";

type OrgMembersSectionProps = {
  orgId: string;
  canManage: boolean;
};

export function OrgMembersSection({ orgId, canManage }: OrgMembersSectionProps) {
  const membersQuery = useOrganizationMembers(orgId);
  const invitesQuery = useOrganizationInvites(orgId, canManage);
  const inviteMember = useInviteOrganizationMember(orgId);
  const updateRole = useUpdateOrganizationMemberRole(orgId);
  const removeMember = useRemoveOrganizationMember(orgId);
  const resendInvite = useResendOrganizationInvite(orgId);
  const revokeInvite = useRevokeOrganizationInvite(orgId);

  const [inviteOpen, setInviteOpen] = useState(false);
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

  const invite = useToastMutation({
    mutationFn: (input: { email: string; role: string }) =>
      inviteMember.mutateAsync({
        email: input.email,
        role: input.role as Exclude<OrganizationRole, "owner">,
      }),
    errorMessage: "Could not send invite",
    onSuccess: (result) => {
      setInviteOpen(false);
      showToast(
        result.status === "pending_invite" ? "Invite sent" : "Member added",
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
        role: role as Exclude<OrganizationRole, "owner">,
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
              Organization members can be assigned to one or more workspaces.
            </p>
          </div>
          {canManage ? (
            <Button variant="primary" onClick={() => setInviteOpen(true)}>
              Invite member
            </Button>
          ) : null}
        </div>

        {membersQuery.isLoading ? (
          <p className="text-ui-sm text-text-secondary">Loading members...</p>
        ) : (
          <MemberList
            members={members}
            canManage={canManage}
            protectedRole="owner"
            roleOptions={ORG_MEMBER_ROLE_OPTIONS}
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
        title="Invite organization member"
        description="Add someone to your organization by email."
        roleOptions={ORG_MEMBER_ROLE_OPTIONS}
        defaultRole="member"
        isPending={invite.isPending}
        onInvite={(input) => invite.mutate(input)}
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
            ? `Remove ${removeTarget.name} from this organization? They will lose access to all workspaces.`
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
