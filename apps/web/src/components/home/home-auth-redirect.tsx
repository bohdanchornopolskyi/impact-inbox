"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@repo/ui/client";
import { listWorkspaces } from "@/lib/api/workspaces-api";
import { getApiErrorMessage, isApiErrorCode } from "@/lib/api-error";
import {
  resolveAuthenticatedDestination,
  sessionQueryKeys,
  useAuthTokenState,
} from "@/lib/auth-session";

export function HomeAuthRedirect() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, isReady, clearToken } = useAuthTokenState();

  const handleSignOut = useCallback(() => {
    clearToken();
    queryClient.removeQueries({ queryKey: sessionQueryKeys.all });
  }, [clearToken, queryClient]);

  const workspacesQuery = useQuery({
    queryKey: sessionQueryKeys.workspaces(token ?? ""),
    queryFn: () => listWorkspaces(token!),
    enabled: isReady && Boolean(token),
  });

  useEffect(() => {
    if (!isApiErrorCode(workspacesQuery.error, "UNAUTHORIZED")) {
      return;
    }

    handleSignOut();
  }, [handleSignOut, workspacesQuery.error]);

  useEffect(() => {
    if (
      !isReady ||
      !token ||
      workspacesQuery.isPending ||
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
    workspacesQuery.isPending,
  ]);

  if (!isReady || !token) {
    return null;
  }

  if (
    workspacesQuery.isError &&
    isApiErrorCode(workspacesQuery.error, "UNAUTHORIZED")
  ) {
    return null;
  }

  if (workspacesQuery.isPending) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-page">
        <p className="text-ui-sm text-text-secondary">
          Loading your workspace...
        </p>
      </div>
    );
  }

  if (workspacesQuery.isError) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
        <h1 className="text-ui-2xl font-semibold text-text-primary">
          Could not load your session
        </h1>
        <p className="max-w-md text-ui-sm text-text-secondary">
          {getApiErrorMessage(workspacesQuery.error)}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleSignOut}>
            Continue as guest
          </Button>
          <Button variant="primary" onClick={() => router.push("/sign-in")}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (workspacesQuery.data.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
        <h1 className="text-ui-2xl font-semibold text-text-primary">
          No workspace access yet
        </h1>
        <p className="max-w-md text-ui-sm text-text-secondary">
          Your account is signed in, but no workspace has been assigned. Ask an
          organization admin for access.
        </p>
        <Link
          href="/sign-in"
          className="text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
          onClick={handleSignOut}
        >
          Sign in with a different account
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-page">
      <p className="text-ui-sm text-text-secondary">
        Taking you to your workspace...
      </p>
    </div>
  );
}
