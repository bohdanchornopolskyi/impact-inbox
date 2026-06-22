import type {
  InviteOrganizationMemberInput,
  OrganizationDetailData,
  OrganizationListItemData,
  OrganizationMemberData,
  OrganizationMemberWithUserData,
  UpdateOrganizationMemberRoleInput,
} from "@repo/shared";
import { apiRequest } from "@/lib/api-client";

export function listOrganizations(
  token: string,
): Promise<OrganizationListItemData[]> {
  return apiRequest<OrganizationListItemData[]>("/organizations", { token });
}

export function getOrganization(
  token: string,
  orgId: string,
): Promise<OrganizationDetailData> {
  return apiRequest<OrganizationDetailData>(`/organizations/${orgId}`, {
    token,
  });
}

export function listOrganizationMembers(
  token: string,
  orgId: string,
): Promise<OrganizationMemberWithUserData[]> {
  return apiRequest<OrganizationMemberWithUserData[]>(
    `/organizations/${orgId}/members`,
    { token },
  );
}

export function inviteOrganizationMember(
  token: string,
  orgId: string,
  input: InviteOrganizationMemberInput,
): Promise<OrganizationMemberData> {
  return apiRequest<OrganizationMemberData>(`/organizations/${orgId}/members`, {
    token,
    method: "POST",
    body: input,
  });
}

export function updateOrganizationMemberRole(
  token: string,
  orgId: string,
  userId: string,
  input: UpdateOrganizationMemberRoleInput,
): Promise<OrganizationMemberData> {
  return apiRequest<OrganizationMemberData>(
    `/organizations/${orgId}/members/${userId}`,
    {
      token,
      method: "PATCH",
      body: input,
    },
  );
}

export function removeOrganizationMember(
  token: string,
  orgId: string,
  userId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(
    `/organizations/${orgId}/members/${userId}`,
    {
      token,
      method: "DELETE",
    },
  );
}
