"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type {
  ConfirmEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
} from "@repo/shared";
import {
  confirmEmail,
  forgotPassword,
  resendVerification,
  resetPassword,
  signIn,
  signUp,
} from "@/lib/api/auth-api";
import {
  getAuthToken,
  navigateAfterAuth,
  setAuthToken,
} from "@/lib/auth-session";

export function useSignIn() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignInInput) => signIn(input),
    onSuccess: async ({ token }) => {
      setAuthToken(token);
      await navigateAfterAuth(router, token);
    },
  });
}

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignUpInput) => signUp(input),
    onSuccess: async ({ token }, variables) => {
      setAuthToken(token);
      router.push(
        `/verify-email?email=${encodeURIComponent(variables.email)}`,
      );
      router.refresh();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPassword(input),
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: ResetPasswordInput) => resetPassword(input),
    onSuccess: () => {
      router.refresh();
    },
  });
}

export function useConfirmEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: ConfirmEmailInput) => confirmEmail(input),
    onSuccess: () => {
      router.refresh();
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Sign in to resend verification email.");
      }

      return resendVerification(token);
    },
  });
}
