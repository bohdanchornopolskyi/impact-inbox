const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;

const SESSION_EXPIRES_AT = 1000 * 60 * 60 * 24 * 30;

export { WORKSPACE_ROLES, SESSION_EXPIRES_AT };
