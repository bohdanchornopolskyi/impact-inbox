import type {
  InviteOrganizationMemberInput,
  OrganizationDetailData,
  OrganizationListItemData,
  OrganizationMemberData,
  OrganizationMemberWithUserData,
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
