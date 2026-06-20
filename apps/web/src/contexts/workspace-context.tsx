"use client";

import { createContext, useContext, useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { WorkspaceDetailData } from "@repo/shared";
import { isApiErrorCode } from "@/lib/api-error";
import { getWorkspaceBySlug } from "@/lib/api/workspaces-api";
import { useSession } from "@/contexts/session-context";

type WorkspaceContextValue = {
  workspace: WorkspaceDetailData;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ workspaceSlug: string }>();
  const { token } = useSession();
  const workspaceSlug = params.workspaceSlug;

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceSlug, token],
    queryFn: () => getWorkspaceBySlug(token, workspaceSlug),
    enabled: Boolean(workspaceSlug),
  });

  if (workspaceQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-ui-sm text-text-secondary">Loading workspace...</p>
      </div>
    );
  }

  if (isApiErrorCode(workspaceQuery.error, "NOT_FOUND")) {
    notFound();
  }

  if (workspaceQuery.error || !workspaceQuery.data) {
    throw workspaceQuery.error ?? new Error("Failed to load workspace");
  }

  const value = useMemo(
    () => ({ workspace: workspaceQuery.data }),
    [workspaceQuery.data],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return context;
}

export function useOptionalWorkspace(): WorkspaceContextValue | null {
  return useContext(WorkspaceContext);
}
