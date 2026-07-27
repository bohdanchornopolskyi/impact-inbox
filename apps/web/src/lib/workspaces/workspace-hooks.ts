"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateWorkspaceModuleInput,
  UpdateOrganizationAssetInput,
  UpdateWorkspaceInput,
  UpdateWorkspaceModuleInput,
} from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { sessionQueryKeys } from "@/lib/auth-session";
import {
  deleteOrganizationAsset,
  listOrganizationAssets,
  updateOrganizationAsset,
  uploadWorkspaceAsset,
} from "@/lib/api/assets-api";
import {
  createWorkspaceModule,
  deleteWorkspaceModule,
  listWorkspaceModules,
  updateWorkspace,
  updateWorkspaceModule,
} from "@/lib/api/workspaces-api";

export function useUpdateWorkspaceSettings() {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      input,
    }: {
      workspaceId: string;
      input: UpdateWorkspaceInput;
    }) => updateWorkspace(token, workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionQueryKeys.workspaces(token),
      });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
  });
}

export function useWorkspaceModules(workspaceId: string) {
  const { token } = useSession();

  return useQuery({
    queryKey: ["workspace-modules", workspaceId],
    queryFn: () => listWorkspaceModules(token, workspaceId),
    enabled: Boolean(token && workspaceId),
  });
}

export function useCreateWorkspaceModule(workspaceId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceModuleInput) =>
      createWorkspaceModule(token, workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-modules", workspaceId],
      });
    },
  });
}

export function useUpdateWorkspaceModule(workspaceId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      input,
    }: {
      moduleId: string;
      input: UpdateWorkspaceModuleInput;
    }) => updateWorkspaceModule(token, workspaceId, moduleId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-modules", workspaceId],
      });
    },
  });
}

export function useDeleteWorkspaceModule(workspaceId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) =>
      deleteWorkspaceModule(token, workspaceId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-modules", workspaceId],
      });
    },
  });
}

export function organizationAssetsQueryKey(
  workspaceId: string,
  organizationId: string,
) {
  return ["organization-assets", organizationId, workspaceId] as const;
}

export function useOrganizationAssets(
  workspaceId: string,
  organizationId: string,
) {
  const { token } = useSession();

  return useQuery({
    queryKey: organizationAssetsQueryKey(workspaceId, organizationId),
    queryFn: () => listOrganizationAssets(token, workspaceId),
    enabled: Boolean(token && workspaceId && organizationId),
  });
}

export function useUploadOrganizationAsset(
  workspaceId: string,
  organizationId: string,
) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadWorkspaceAsset(token, workspaceId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationAssetsQueryKey(workspaceId, organizationId),
      });
    },
  });
}

export function useUpdateOrganizationAsset(
  workspaceId: string,
  organizationId: string,
) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assetId,
      input,
    }: {
      assetId: string;
      input: UpdateOrganizationAssetInput;
    }) => updateOrganizationAsset(token, workspaceId, assetId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationAssetsQueryKey(workspaceId, organizationId),
      });
    },
  });
}

export function useDeleteOrganizationAsset(
  workspaceId: string,
  organizationId: string,
) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) =>
      deleteOrganizationAsset(token, workspaceId, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationAssetsQueryKey(workspaceId, organizationId),
      });
    },
  });
}
