"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InviteMemberInput,
  UpdateMemberRoleInput,
  WorkspaceRole,
} from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import {
  inviteWorkspaceMember,
  listWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from "@/lib/api/workspaces-api";
import { workspaceQueryKeys } from "@/lib/workspaces/workspace-query-keys";

export function useWorkspaceMembers(workspaceId: string) {
  const { token } = useSession();

  return useQuery({
    queryKey: workspaceQueryKeys.members(workspaceId, token),
    queryFn: () => listWorkspaceMembers(token, workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useInviteWorkspaceMember(workspaceId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteMemberInput) =>
      inviteWorkspaceMember(token, workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.members(workspaceId, token),
      });
    },
  });
}

export function useUpdateWorkspaceMemberRole(workspaceId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: Exclude<WorkspaceRole, "owner">;
    }) =>
      updateWorkspaceMemberRole(token, workspaceId, userId, {
        role,
      } satisfies UpdateMemberRoleInput),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.members(workspaceId, token),
      });
    },
  });
}

export function useRemoveWorkspaceMember(workspaceId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      removeWorkspaceMember(token, workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.members(workspaceId, token),
      });
    },
  });
}
