import type {
  AuthTokenData,
  ConfirmEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  SuccessData,
} from "@repo/shared";
import { apiRequest } from "@/lib/api-client";

export function signIn(input: SignInInput): Promise<AuthTokenData> {
  return apiRequest<AuthTokenData>("/auth/sign-in", {
    method: "POST",
    body: input,
  });
}

export function signUp(input: SignUpInput): Promise<AuthTokenData> {
  return apiRequest<AuthTokenData>("/auth/sign-up", {
    method: "POST",
    body: input,
  });
}

export function forgotPassword(input: ForgotPasswordInput): Promise<SuccessData> {
  return apiRequest<SuccessData>("/auth/forgot-password", {
    method: "POST",
    body: input,
  });
}

export function resetPassword(input: ResetPasswordInput): Promise<SuccessData> {
  return apiRequest<SuccessData>("/auth/reset-password", {
    method: "POST",
    body: input,
  });
}

export function confirmEmail(input: ConfirmEmailInput): Promise<SuccessData> {
  return apiRequest<SuccessData>("/auth/confirm-email", {
    method: "POST",
    body: input,
  });
}

export function resendVerification(token: string): Promise<SuccessData> {
  return apiRequest<SuccessData>("/auth/resend-verification", {
    method: "POST",
    token,
  });
}
