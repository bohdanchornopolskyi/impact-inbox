"use client";

import { Button } from "@repo/ui/client";
import { MemberRoleSelect, type RoleOption } from "@/components/members/member-role-select";
import { formatRoleLabel } from "@/lib/members/format-role-label";

export type MemberListItem = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

type MemberListProps = {
  members: MemberListItem[];
  canManage: boolean;
  protectedRole: string;
  roleOptions: RoleOption[];
  pendingUserId?: string | null;
  onRoleChange: (userId: string, role: string) => void;
  onRemove: (member: MemberListItem) => void;
};

export function MemberList({
  members,
  canManage,
  protectedRole,
  roleOptions,
  pendingUserId,
  onRoleChange,
  onRemove,
}: MemberListProps) {
  if (members.length === 0) {
    return (
      <p className="text-ui-sm text-text-secondary">No members yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle rounded-xl border border-border-default">
      {members.map((member) => {
        const isProtected = member.role === protectedRole;
        const isPending = pendingUserId === member.userId;

        return (
          <li
            key={member.userId}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-ui-sm font-medium text-text-primary">
                {member.name}
              </p>
              <p className="truncate text-ui-xs text-text-secondary">{member.email}</p>
            </div>

            <div className="flex items-center gap-2">
              {canManage ? (
                <MemberRoleSelect
                  value={member.role}
                  options={
                    isProtected
                      ? [{ value: member.role, label: formatRoleLabel(member.role) }]
                      : roleOptions
                  }
                  disabled={isProtected || isPending}
                  onChange={(role) => onRoleChange(member.userId, role)}
                />
              ) : (
                <span className="text-ui-sm text-text-secondary">
                  {formatRoleLabel(member.role)}
                </span>
              )}

              {canManage && !isProtected ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => onRemove(member)}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
