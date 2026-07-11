import { formatRoleLabel } from "@/lib/members/format-role-label";
import type { RoleOption } from "@/components/members/member-role-select";

export const ORG_MEMBER_ROLE_OPTIONS: RoleOption[] = [
  { value: "member", label: formatRoleLabel("member") },
  { value: "org_admin", label: formatRoleLabel("org_admin") },
];

export const WORKSPACE_MEMBER_ROLE_OPTIONS: RoleOption[] = [
  { value: "member", label: formatRoleLabel("member") },
  { value: "admin", label: formatRoleLabel("admin") },
];
