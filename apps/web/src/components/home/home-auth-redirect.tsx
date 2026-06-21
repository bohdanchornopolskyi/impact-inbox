"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listWorkspaces } from "@/lib/api/workspaces-api";
import {
  resolveAuthenticatedDestination,
  sessionQueryKeys,
  useAuthTokenState,
} from "@/lib/auth-session";

export function HomeAuthRedirect() {
  const router = useRouter();
  const { token, isReady } = useAuthTokenState();

  const workspacesQuery = useQuery({
    queryKey: sessionQueryKeys.workspaces(token ?? ""),
    queryFn: () => listWorkspaces(token!),
    enabled: isReady && Boolean(token),
  });

  useEffect(() => {
    if (
      !isReady ||
      !token ||
      workspacesQuery.isLoading ||
      !workspacesQuery.data
    ) {
      return;
    }

    const destination = resolveAuthenticatedDestination(workspacesQuery.data);
    if (destination.kind === "workspace") {
      router.replace(destination.path);
    }
  }, [
    isReady,
    router,
    token,
    workspacesQuery.data,
    workspacesQuery.isLoading,
  ]);

  if (!isReady || !token) {
    return null;
  }

  if (workspacesQuery.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-page">
        <p className="text-ui-sm text-text-secondary">
          Loading your workspace...
        </p>
      </div>
    );
  }

  if (workspacesQuery.data && workspacesQuery.data.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
        <h1 className="text-ui-2xl font-semibold text-text-primary">
          No workspace access yet
        </h1>
        <p className="max-w-md text-ui-sm text-text-secondary">
          Your account is signed in, but no workspace has been assigned. Ask an
          organization admin for access.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-page">
      <p className="text-ui-sm text-text-secondary">
        Loading your workspace...
      </p>
    </div>
  );
}
