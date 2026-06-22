"use client";

import { useEffect, useState } from "react";
import { Button, Input, Modal } from "@repo/ui/client";
import { SelectField } from "@/components/template-builder/inspector/fields";
import type { RoleOption } from "@/components/members/member-role-select";

type InviteMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  roleOptions: RoleOption[];
  defaultRole: string;
  inviteHint?: string;
  isPending: boolean;
  onInvite: (input: { email: string; role: string }) => void;
};

export function InviteMemberModal({
  open,
  onOpenChange,
  title,
  description,
  roleOptions,
  defaultRole,
  inviteHint,
  isPending,
  onInvite,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(defaultRole);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole(defaultRole);
    }
  }, [defaultRole, open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    onInvite({ email: trimmedEmail, role });
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="invite-member-form"
            variant="primary"
            disabled={!email.trim() || isPending}
          >
            Send invite
          </Button>
        </>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="colleague@company.com"
          autoFocus
        />
        <SelectField
          label="Role"
          value={role}
          onChange={setRole}
          options={roleOptions}
        />
        {inviteHint ? (
          <p className="text-ui-xs text-text-tertiary">{inviteHint}</p>
        ) : null}
      </form>
    </Modal>
  );
}
