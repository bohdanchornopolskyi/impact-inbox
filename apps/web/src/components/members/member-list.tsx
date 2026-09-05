"use client";

import { Avatar, Button } from "@repo/ui/client";
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
    <ul className="overflow-hidden rounded-lg border border-border">
      {members.map((member) => {
        const isProtected = member.role === protectedRole;
        const isPending = pendingUserId === member.userId;

        return (
          <li
            key={member.userId}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 transition-[background-color] duration-150 ease-out last:border-b-0 hover:bg-neutral-50"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar name={member.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">
                  {member.name}
                </p>
                <p className="truncate text-xs text-text-2">{member.email}</p>
              </div>
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
