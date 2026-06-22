import type {
  CreateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  WorkspaceDetailData,
  WorkspaceListItemData,
  WorkspaceMemberData,
  WorkspaceMemberWithUserData,
} from "@repo/shared";
import { apiRequest } from "@/lib/api-client";

export function listWorkspaces(token: string): Promise<WorkspaceListItemData[]> {
  return apiRequest<WorkspaceListItemData[]>("/workspaces", { token });
}

export function getWorkspaceBySlug(
  token: string,
  slug: string,
): Promise<WorkspaceDetailData> {
  return apiRequest<WorkspaceDetailData>(`/workspaces/by-slug/${slug}`, {
    token,
  });
}

export function createWorkspace(
  token: string,
  input: CreateWorkspaceInput,
): Promise<WorkspaceDetailData> {
  return apiRequest<WorkspaceDetailData>("/workspaces", {
    method: "POST",
    body: input,
    token,
  });
}

export function listWorkspaceMembers(
  token: string,
  workspaceId: string,
): Promise<WorkspaceMemberWithUserData[]> {
  return apiRequest<WorkspaceMemberWithUserData[]>(
    `/workspaces/${workspaceId}/members`,
    { token },
  );
}

export function inviteWorkspaceMember(
  token: string,
  workspaceId: string,
  input: InviteMemberInput,
): Promise<WorkspaceMemberData> {
  return apiRequest<WorkspaceMemberData>(
    `/workspaces/${workspaceId}/members`,
    {
      token,
      method: "POST",
      body: input,
    },
  );
}

export function updateWorkspaceMemberRole(
  token: string,
  workspaceId: string,
  userId: string,
  input: UpdateMemberRoleInput,
): Promise<WorkspaceMemberData> {
  return apiRequest<WorkspaceMemberData>(
    `/workspaces/${workspaceId}/members/${userId}`,
    {
      token,
      method: "PATCH",
      body: input,
    },
  );
}

export function removeWorkspaceMember(
  token: string,
  workspaceId: string,
  userId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(
    `/workspaces/${workspaceId}/members/${userId}`,
    {
      token,
      method: "DELETE",
    },
  );
}
