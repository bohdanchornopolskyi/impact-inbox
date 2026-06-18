"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { SignInInput, SignUpInput } from "@repo/shared";
import { signIn, signUp } from "@/lib/auth-api";
import { setAuthToken } from "@/lib/auth-token";

export function useSignIn() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignInInput) => signIn(input),
    onSuccess: ({ token }) => {
      setAuthToken(token);
      router.push("/");
      router.refresh();
    },
  });
}

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignUpInput) => signUp(input),
    onSuccess: ({ token }) => {
      setAuthToken(token);
      router.push("/");
      router.refresh();
    },
  });
}
