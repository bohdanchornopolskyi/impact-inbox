import type { AuthTokenData, SignInInput, SignUpInput } from "@repo/shared";
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
