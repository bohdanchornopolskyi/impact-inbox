"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateWorkspaceModuleInput,
  UpdateWorkspaceInput,
} from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { sessionQueryKeys } from "@/lib/auth-session";
import {
  createWorkspaceModule,
  deleteWorkspaceModule,
  listWorkspaceModules,
  updateWorkspace,
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
