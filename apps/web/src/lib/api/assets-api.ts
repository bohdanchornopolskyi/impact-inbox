import type {
  OrganizationAssetData,
  OrganizationAssetUsageData,
  UpdateOrganizationAssetInput,
} from "@repo/shared";
import { apiRequest, apiUploadRequest } from "@/lib/api-client";

function assetsPath(workspaceId: string, suffix = ""): string {
  return `/workspaces/${workspaceId}/assets${suffix}`;
}

export function listOrganizationAssets(
  token: string,
  workspaceId: string,
): Promise<OrganizationAssetData[]> {
  return apiRequest<OrganizationAssetData[]>(assetsPath(workspaceId), {
    token,
  });
}

export function getOrganizationAssetUsage(
  token: string,
  workspaceId: string,
  assetId: string,
): Promise<OrganizationAssetUsageData> {
  return apiRequest<OrganizationAssetUsageData>(
    assetsPath(workspaceId, `/${assetId}/usage`),
    { token },
  );
}

export function uploadWorkspaceAsset(
  token: string,
  workspaceId: string,
  file: File,
): Promise<OrganizationAssetData> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadRequest<OrganizationAssetData>(
    assetsPath(workspaceId),
    token,
    formData,
  );
}

export function updateOrganizationAsset(
  token: string,
  workspaceId: string,
  assetId: string,
  input: UpdateOrganizationAssetInput,
): Promise<OrganizationAssetData> {
  return apiRequest<OrganizationAssetData>(
    assetsPath(workspaceId, `/${assetId}`),
    { token, method: "PATCH", body: input },
  );
}

export function deleteOrganizationAsset(
  token: string,
  workspaceId: string,
  assetId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(
    assetsPath(workspaceId, `/${assetId}`),
    { token, method: "DELETE" },
  );
}
