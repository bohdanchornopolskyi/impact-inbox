"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { SignInInput, SignUpInput } from "@repo/shared";
import { signIn, signUp } from "@/lib/api/auth-api";
import { resolveDefaultAppPath } from "@/lib/app-navigation";
import { listWorkspaces } from "@/lib/api/workspaces-api";
import { setAuthToken } from "@/lib/auth-token";

async function resolvePostAuthPath(token: string): Promise<string> {
  const workspaces = await listWorkspaces(token);
  return resolveDefaultAppPath(workspaces) ?? "/";
}

export function useSignIn() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignInInput) => signIn(input),
    onSuccess: async ({ token }) => {
      setAuthToken(token);
      const destination = await resolvePostAuthPath(token);
      router.push(destination);
      router.refresh();
    },
  });
}

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignUpInput) => signUp(input),
    onSuccess: async ({ token }) => {
      setAuthToken(token);
      const destination = await resolvePostAuthPath(token);
      router.push(destination);
      router.refresh();
    },
  });
}
