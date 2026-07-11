import type {
  InviteAcceptInput,
  InviteAcceptResultData,
  InviteData,
  InvitePreviewData,
  OrganizationMemberInviteResultData,
  WorkspaceMemberInviteResultData,
} from "@repo/shared";
import { apiRequest } from "@/lib/api-client";

export function previewInvite(token: string): Promise<InvitePreviewData> {
  const params = new URLSearchParams({ token });
  return apiRequest<InvitePreviewData>(`/invites/preview?${params.toString()}`);
}

export function acceptInvite(
  input: InviteAcceptInput,
  token?: string | null,
): Promise<InviteAcceptResultData> {
  return apiRequest<InviteAcceptResultData>("/invites/accept", {
    method: "POST",
    body: input,
    token,
  });
}

export function listOrganizationInvites(
  token: string,
  orgId: string,
): Promise<InviteData[]> {
  return apiRequest<InviteData[]>(`/organizations/${orgId}/invites`, { token });
}

export function revokeOrganizationInvite(
  token: string,
  orgId: string,
  inviteId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(
    `/organizations/${orgId}/invites/${inviteId}`,
    {
      token,
      method: "DELETE",
    },
  );
}

export function resendOrganizationInvite(
  token: string,
  orgId: string,
  inviteId: string,
): Promise<InviteData> {
  return apiRequest<InviteData>(
    `/organizations/${orgId}/invites/${inviteId}/resend`,
    {
      token,
      method: "POST",
    },
  );
}

export function listWorkspaceInvites(
  token: string,
  workspaceId: string,
): Promise<InviteData[]> {
  return apiRequest<InviteData[]>(`/workspaces/${workspaceId}/invites`, {
    token,
  });
}

export function revokeWorkspaceInvite(
  token: string,
  workspaceId: string,
  inviteId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(
    `/workspaces/${workspaceId}/invites/${inviteId}`,
    {
      token,
      method: "DELETE",
    },
  );
}

export function resendWorkspaceInvite(
  token: string,
  workspaceId: string,
  inviteId: string,
): Promise<InviteData> {
  return apiRequest<InviteData>(
    `/workspaces/${workspaceId}/invites/${inviteId}/resend`,
    {
      token,
      method: "POST",
    },
  );
}

export type {
  OrganizationMemberInviteResultData,
  WorkspaceMemberInviteResultData,
};
