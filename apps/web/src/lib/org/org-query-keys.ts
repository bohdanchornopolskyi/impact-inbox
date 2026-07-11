export const orgQueryKeys = {
  detail: (orgId: string, token: string | null) =>
    ["organization", orgId, token] as const,
  members: (orgId: string, token: string | null) =>
    ["organization-members", orgId, token] as const,
  invites: (orgId: string, token: string | null) =>
    ["organization-invites", orgId, token] as const,
};
