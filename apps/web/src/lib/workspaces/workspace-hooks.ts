"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateWorkspaceInput } from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { sessionQueryKeys } from "@/lib/auth-session";
import { updateWorkspace } from "@/lib/api/workspaces-api";

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
