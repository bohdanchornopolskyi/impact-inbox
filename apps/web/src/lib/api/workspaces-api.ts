import type {
  CreateWorkspaceInput,
  WorkspaceDetailData,
  WorkspaceListItemData,
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
