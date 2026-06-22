export const workspaceQueryKeys = {
  members: (workspaceId: string, token: string | null) =>
    ["workspace-members", workspaceId, token] as const,
};
