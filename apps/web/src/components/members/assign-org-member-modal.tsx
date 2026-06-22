"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@repo/ui/client";
import { SelectField } from "@/components/template-builder/inspector/fields";
import type { RoleOption } from "@/components/members/member-role-select";
import type { MemberListItem } from "@/components/members/member-list";

type AssignOrgMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: MemberListItem[];
  roleOptions: RoleOption[];
  defaultRole: string;
  isPending: boolean;
  onAssign: (input: { email: string; role: string }) => void;
};

export function AssignOrgMemberModal({
  open,
  onOpenChange,
  candidates,
  roleOptions,
  defaultRole,
  isPending,
  onAssign,
}: AssignOrgMemberModalProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(defaultRole);

  useEffect(() => {
    if (!open) {
      setUserId("");
      setRole(defaultRole);
    }
  }, [defaultRole, open]);

  const selectedMember = candidates.find((candidate) => candidate.userId === userId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedMember) {
      return;
    }

    onAssign({ email: selectedMember.email, role });
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add org member"
      description="Assign an existing organization member to this workspace."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="assign-org-member-form"
            variant="primary"
            disabled={!selectedMember || isPending}
          >
            Add to workspace
          </Button>
        </>
      }
    >
      <form
        id="assign-org-member-form"
        onSubmit={handleSubmit}
        className="mt-4 space-y-4"
      >
        {candidates.length === 0 ? (
          <p className="text-ui-sm text-text-secondary">
            All organization members are already on this workspace.
          </p>
        ) : (
          <>
            <SelectField
              label="Member"
              value={userId}
              onChange={setUserId}
              options={[
                { value: "", label: "Select a member" },
                ...candidates.map((candidate) => ({
                  value: candidate.userId,
                  label: `${candidate.name} (${candidate.email})`,
                })),
              ]}
            />
            <SelectField
              label="Workspace role"
              value={role}
              onChange={setRole}
              options={roleOptions}
            />
          </>
        )}
      </form>
    </Modal>
  );
}
