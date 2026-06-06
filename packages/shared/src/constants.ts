const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;

const SESSION_EXPIRES_AT = 1000 * 60 * 60 * 24 * 30;

const AUTH_HEADER = "Authorization" as const;
const AUTH_SCHEME = "Bearer" as const;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password" as const;

function createAuthorizationHeader(token: string): string {
  return `${AUTH_SCHEME} ${token}`;
}

export {
  WORKSPACE_ROLES,
  SESSION_EXPIRES_AT,
  AUTH_HEADER,
  AUTH_SCHEME,
  INVALID_CREDENTIALS_MESSAGE,
  createAuthorizationHeader,
};
