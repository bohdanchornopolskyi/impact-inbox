"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateWorkspaceInput,
  InviteOrganizationMemberInput,
  OrganizationRole,
  UpdateOrganizationMemberRoleInput,
} from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { sessionQueryKeys } from "@/lib/auth-session";
import {
  inviteOrganizationMember,
  listOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "@/lib/api/organizations-api";
import { createWorkspace } from "@/lib/api/workspaces-api";
import { orgQueryKeys } from "@/lib/org/org-query-keys";

export function useOrganizationMembers(orgId: string) {
  const { token } = useSession();

  return useQuery({
    queryKey: orgQueryKeys.members(orgId, token),
    queryFn: () => listOrganizationMembers(token, orgId),
    enabled: Boolean(orgId),
  });
}

export function useInviteOrganizationMember(orgId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteOrganizationMemberInput) =>
      inviteOrganizationMember(token, orgId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orgQueryKeys.members(orgId, token),
      });
    },
  });
}

export function useUpdateOrganizationMemberRole(orgId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: Exclude<OrganizationRole, "owner">;
    }) =>
      updateOrganizationMemberRole(token, orgId, userId, {
        role,
      } satisfies UpdateOrganizationMemberRoleInput),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orgQueryKeys.members(orgId, token),
      });
    },
  });
}

export function useRemoveOrganizationMember(orgId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      removeOrganizationMember(token, orgId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orgQueryKeys.members(orgId, token),
      });
    },
  });
}

export function useCreateWorkspace() {
  const { token } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => createWorkspace(token, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionQueryKeys.workspaces(token),
      });
    },
  });
}
