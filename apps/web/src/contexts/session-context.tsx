"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  OrganizationListItemData,
  UserProfileData,
  WorkspaceListItemData,
} from "@repo/shared";
import { Button } from "@repo/ui/client";
import { getApiErrorMessage, isApiErrorCode } from "@/lib/api-error";
import { listOrganizations } from "@/lib/api/organizations-api";
import { getMe } from "@/lib/api/users-api";
import { listWorkspaces } from "@/lib/api/workspaces-api";
import {
  sessionQueryKeys,
  signOutSession,
  useSessionSignOut,
} from "@/lib/auth-session";

type SessionContextValue = {
  token: string;
  user: UserProfileData;
  organizations: OrganizationListItemData[];
  workspaces: WorkspaceListItemData[];
  isLoading: boolean;
  signOut: () => void;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState(token);

  const clearSession = useCallback(() => {
    setSessionToken("");
  }, []);

  const handleUnauthorized = useCallback(() => {
    clearSession();
    signOutSession(router, queryClient);
  }, [clearSession, queryClient, router]);

  const meQuery = useQuery({
    queryKey: sessionQueryKeys.me(sessionToken),
    queryFn: () => getMe(sessionToken),
    enabled: Boolean(sessionToken),
  });

  const organizationsQuery = useQuery({
    queryKey: sessionQueryKeys.organizations(sessionToken),
    queryFn: () => listOrganizations(sessionToken),
    enabled: Boolean(sessionToken),
  });

  const workspacesQuery = useQuery({
    queryKey: sessionQueryKeys.workspaces(sessionToken),
    queryFn: () => listWorkspaces(sessionToken),
    enabled: Boolean(sessionToken),
  });

  useEffect(() => {
    const error =
      meQuery.error ?? organizationsQuery.error ?? workspacesQuery.error;

    if (isApiErrorCode(error, "UNAUTHORIZED")) {
      handleUnauthorized();
    }
  }, [
    handleUnauthorized,
    meQuery.error,
    organizationsQuery.error,
    workspacesQuery.error,
  ]);

  const isLoading =
    meQuery.isLoading ||
    organizationsQuery.isLoading ||
    workspacesQuery.isLoading;

  const refreshSession = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
  }, [queryClient]);

  const signOut = useSessionSignOut(queryClient, clearSession);
  const sessionError =
    meQuery.error ?? organizationsQuery.error ?? workspacesQuery.error;
  const hasSessionError =
    Boolean(sessionError) && !isApiErrorCode(sessionError, "UNAUTHORIZED");

  const retrySession = useCallback(() => {
    void meQuery.refetch();
    void organizationsQuery.refetch();
    void workspacesQuery.refetch();
  }, [meQuery.refetch, organizationsQuery.refetch, workspacesQuery.refetch]);

  const value = useMemo((): SessionContextValue | null => {
    if (!meQuery.data) {
      return null;
    }

    return {
      token: sessionToken,
      user: meQuery.data,
      organizations: organizationsQuery.data ?? [],
      workspaces: workspacesQuery.data ?? [],
      isLoading,
      signOut,
      refreshSession,
    };
  }, [
    sessionToken,
    meQuery.data,
    organizationsQuery.data,
    workspacesQuery.data,
    isLoading,
    signOut,
    refreshSession,
  ]);

  if (hasSessionError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-ui-2xl font-semibold text-text-primary">
          Could not load your session
        </h1>
        <p className="max-w-md text-ui-sm text-text-secondary">
          {sessionError instanceof TypeError
            ? "The app could not reach the API. Start the API server, then try again."
            : getApiErrorMessage(sessionError)}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={signOut}>
            Sign in
          </Button>
          <Button variant="primary" onClick={retrySession}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !value) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-ui-sm text-text-secondary">Loading session...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}

export function useOptionalSession(): SessionContextValue | null {
  return useContext(SessionContext);
}
