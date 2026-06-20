"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { resolveDefaultAppPath } from "@/lib/app-navigation";
import { listWorkspaces } from "@/lib/api/workspaces-api";
import { useAuthToken } from "@/lib/use-auth-token";

export function HomeAuthRedirect() {
  const router = useRouter();
  const { token, isReady } = useAuthToken();

  const workspacesQuery = useQuery({
    queryKey: ["home", "workspaces", token],
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

    const destination = resolveDefaultAppPath(workspacesQuery.data);
    if (destination) {
      router.replace(destination);
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
