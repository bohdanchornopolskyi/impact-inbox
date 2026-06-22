"use client";

import { formatRoleLabel } from "@/lib/members/format-role-label";

export type RoleOption = {
  value: string;
  label: string;
};

type MemberRoleSelectProps = {
  value: string;
  options: RoleOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function MemberRoleSelect({
  value,
  options,
  disabled,
  onChange,
}: MemberRoleSelectProps) {
  if (disabled) {
    return (
      <span className="text-ui-sm text-text-secondary">{formatRoleLabel(value)}</span>
    );
  }

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-md border border-border-strong bg-surface-card px-2 py-1 text-ui-sm text-text-primary outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
