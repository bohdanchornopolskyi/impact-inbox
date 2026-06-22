export const orgQueryKeys = {
  detail: (orgId: string, token: string | null) =>
    ["organization", orgId, token] as const,
  members: (orgId: string, token: string | null) =>
    ["organization-members", orgId, token] as const,
};
