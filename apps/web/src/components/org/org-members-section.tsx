"use client";

import { useMemo, useState } from "react";
import type { OrganizationRole } from "@repo/shared";
import { Button } from "@repo/ui/client";
import { AssignOrgMemberModal } from "@/components/members/assign-org-member-modal";
import { InviteMemberModal } from "@/components/members/invite-member-modal";
import {
  MemberList,
  type MemberListItem,
} from "@/components/members/member-list";
import { ConfirmModal } from "@/components/template-builder/modals/confirm-modal";
import { isApiErrorCode } from "@/lib/api-error";
import {
  EXISTING_USER_INVITE_HINT,
  ORG_MEMBER_ROLE_OPTIONS,
} from "@/lib/members/member-role-options";
import {
  useInviteOrganizationMember,
  useOrganizationMembers,
  useRemoveOrganizationMember,
  useUpdateOrganizationMemberRole,
} from "@/lib/org/org-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";

type OrgMembersSectionProps = {
  orgId: string;
  canManage: boolean;
};

export function OrgMembersSection({ orgId, canManage }: OrgMembersSectionProps) {
  const membersQuery = useOrganizationMembers(orgId);
  const inviteMember = useInviteOrganizationMember(orgId);
  const updateRole = useUpdateOrganizationMemberRole(orgId);
  const removeMember = useRemoveOrganizationMember(orgId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<MemberListItem | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

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
    mutationFn: async (input: { email: string; role: string }) => {
      try {
        return await inviteMember.mutateAsync({
          email: input.email,
          role: input.role as Exclude<OrganizationRole, "owner">,
        });
      } catch (error) {
        if (isApiErrorCode(error, "NOT_FOUND")) {
          throw new Error(
            "No account found for that email. They need to sign up before you can add them.",
          );
        }

        throw error;
      }
    },
    successMessage: "Member added",
    errorMessage: "Could not add member",
    onSuccess: () => setInviteOpen(false),
  });

  const remove = useToastMutation({
    mutationFn: (userId: string) => removeMember.mutateAsync(userId),
    successMessage: "Member removed",
    errorMessage: "Could not remove member",
    onSuccess: () => setRemoveTarget(null),
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
    <section className="space-y-4">
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

      <InviteMemberModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite organization member"
        description="Add someone to your organization by email."
        roleOptions={ORG_MEMBER_ROLE_OPTIONS}
        defaultRole="member"
        inviteHint={EXISTING_USER_INVITE_HINT}
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
