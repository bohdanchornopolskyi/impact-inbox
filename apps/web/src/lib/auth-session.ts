"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { QueryClient } from "@tanstack/react-query";
import { getMe } from "@/lib/api/users-api";
import { listWorkspaces } from "@/lib/api/workspaces-api";
import {
  resolveAuthenticatedDestination,
  resolveDefaultAppPath,
  type AuthenticatedDestination,
} from "@/lib/app-navigation";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/auth-token";
import { isApiErrorCode } from "@/lib/api-error";

export type { AuthenticatedDestination };
export {
  resolveAuthenticatedDestination,
  resolveDefaultAppPath,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
};

export const sessionQueryKeys = {
  all: ["session"] as const,
  me: (token: string) => ["session", "me", token] as const,
  organizations: (token: string) =>
    ["session", "organizations", token] as const,
  workspaces: (token: string) => ["session", "workspaces", token] as const,
};

export function useAuthTokenState() {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setToken(getAuthToken());
    setIsReady(true);
  }, []);

  const clearToken = useCallback(() => {
    clearAuthToken();
    setToken(null);
  }, []);

  return { token, isReady, clearToken };
}

export function useAuthGate() {
  const router = useRouter();
  const { token, isReady } = useAuthTokenState();

  useEffect(() => {
    if (isReady && !token) {
      router.replace("/sign-in");
    }
  }, [isReady, router, token]);

  return { token, isReady, isAuthenticated: Boolean(token) };
}

export async function fetchAuthenticatedDestination(
  token: string | null,
): Promise<AuthenticatedDestination> {
  if (!token) {
    return { kind: "sign-in" };
  }

  const workspaces = await listWorkspaces(token);
  return resolveAuthenticatedDestination(workspaces);
}

export async function fetchSessionUserEmail(
  token: string,
): Promise<string | null> {
  try {
    const user = await getMe(token);
    return user.email;
  } catch {
    return null;
  }
}

export async function navigateAfterAuth(
  router: AppRouterInstance,
  token: string,
): Promise<void> {
  let destination: AuthenticatedDestination;

  try {
    destination = await fetchAuthenticatedDestination(token);
  } catch (error) {
    if (isApiErrorCode(error, "UNAUTHORIZED")) {
      clearAuthToken();
      router.replace("/sign-in");
      router.refresh();
      return;
    }

    throw error;
  }

  if (destination.kind === "workspace") {
    router.push(destination.path);
  } else if (destination.kind === "no-access") {
    router.push("/");
  } else {
    router.push("/sign-in");
  }

  router.refresh();
}

export function redirectToSignIn(router: AppRouterInstance): void {
  router.push("/sign-in");
  router.refresh();
}

export function signOutSession(
  router: AppRouterInstance,
  queryClient: QueryClient,
): void {
  clearAuthToken();
  queryClient.clear();
  router.replace("/sign-in");
}

export function useSessionSignOut(
  queryClient: QueryClient,
  onBeforeRedirect?: () => void,
) {
  const router = useRouter();

  return useCallback(() => {
    clearAuthToken();
    onBeforeRedirect?.();
    queryClient.clear();
    router.replace("/sign-in");
  }, [onBeforeRedirect, queryClient, router]);
}
