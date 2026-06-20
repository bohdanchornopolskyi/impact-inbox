const ORGANIZATION_ROLES = ["owner", "org_admin", "member"] as const;

const ORGANIZATION_ROLE_RANK = {
  owner: 3,
  org_admin: 2,
  member: 1,
} as const;

const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function deriveDefaultOrganizationName(userName: string): string {
  return `${userName}'s Organization`;
}

function hasOrganizationRoleAtLeast(
  userRole: (typeof ORGANIZATION_ROLES)[number],
  requiredRoles: readonly (typeof ORGANIZATION_ROLES)[number][],
): boolean {
  const minRequiredRank = Math.min(
    ...requiredRoles.map((role) => ORGANIZATION_ROLE_RANK[role]),
  );
  return ORGANIZATION_ROLE_RANK[userRole] >= minRequiredRank;
}

export {
  ORGANIZATION_ROLES,
  ORGANIZATION_ROLE_RANK,
  TRIAL_DURATION_MS,
  deriveDefaultOrganizationName,
  hasOrganizationRoleAtLeast,
};
