import type {
  OrganizationDetailData,
  OrganizationListItemData,
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
