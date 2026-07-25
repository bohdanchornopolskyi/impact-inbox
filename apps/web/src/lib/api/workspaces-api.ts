import type {
  CreateWorkspaceInput,
  CreateWorkspaceModuleInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateWorkspaceInput,
  UpdateWorkspaceModuleInput,
  WorkspaceDetailData,
  WorkspaceListItemData,
  WorkspaceMemberData,
  WorkspaceMemberInviteResultData,
  WorkspaceMemberWithUserData,
  WorkspaceModuleData,
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

export function updateWorkspace(
  token: string,
  workspaceId: string,
  input: UpdateWorkspaceInput,
): Promise<WorkspaceDetailData> {
  return apiRequest<WorkspaceDetailData>(`/workspaces/${workspaceId}`, {
    method: "PATCH",
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
): Promise<WorkspaceMemberInviteResultData> {
  return apiRequest<WorkspaceMemberInviteResultData>(
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

export function listWorkspaceModules(
  token: string,
  workspaceId: string,
): Promise<WorkspaceModuleData[]> {
  return apiRequest<WorkspaceModuleData[]>(
    `/workspaces/${workspaceId}/modules`,
    { token },
  );
}

export function createWorkspaceModule(
  token: string,
  workspaceId: string,
  input: CreateWorkspaceModuleInput,
): Promise<WorkspaceModuleData> {
  return apiRequest<WorkspaceModuleData>(
    `/workspaces/${workspaceId}/modules`,
    {
      token,
      method: "POST",
      body: input,
    },
  );
}

export function updateWorkspaceModule(
  token: string,
  workspaceId: string,
  moduleId: string,
  input: UpdateWorkspaceModuleInput,
): Promise<WorkspaceModuleData> {
  return apiRequest<WorkspaceModuleData>(
    `/workspaces/${workspaceId}/modules/${moduleId}`,
    {
      token,
      method: "PATCH",
      body: input,
    },
  );
}

export function deleteWorkspaceModule(
  token: string,
  workspaceId: string,
  moduleId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(
    `/workspaces/${workspaceId}/modules/${moduleId}`,
    {
      token,
      method: "DELETE",
    },
  );
}
