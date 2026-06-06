const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;

const WORKSPACE_ROLE_RANK = {
  owner: 3,
  admin: 2,
  member: 1,
} as const satisfies Record<(typeof WORKSPACE_ROLES)[number], number>;

const SESSION_EXPIRES_AT = 1000 * 60 * 60 * 24 * 30;
const EMAIL_VERIFICATION_EXPIRES_AT = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_EXPIRES_AT = 1000 * 60 * 60;

const AUTH_HEADER = "Authorization" as const;
const AUTH_SCHEME = "Bearer" as const;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password" as const;

function createAuthorizationHeader(token: string): string {
  return `${AUTH_SCHEME} ${token}`;
}

function hasWorkspaceRoleAtLeast(
  userRole: (typeof WORKSPACE_ROLES)[number],
  requiredRoles: readonly (typeof WORKSPACE_ROLES)[number][],
): boolean {
  const minRequiredRank = Math.min(
    ...requiredRoles.map((role) => WORKSPACE_ROLE_RANK[role]),
  );
  return WORKSPACE_ROLE_RANK[userRole] >= minRequiredRank;
}

export {
  WORKSPACE_ROLES,
  WORKSPACE_ROLE_RANK,
  SESSION_EXPIRES_AT,
  EMAIL_VERIFICATION_EXPIRES_AT,
  PASSWORD_RESET_EXPIRES_AT,
  AUTH_HEADER,
  AUTH_SCHEME,
  INVALID_CREDENTIALS_MESSAGE,
  createAuthorizationHeader,
  hasWorkspaceRoleAtLeast,
};
