import type { UpdateProfileInput, UserProfileData } from "@repo/shared";
import { apiRequest } from "@/lib/api-client";

export function getMe(token: string): Promise<UserProfileData> {
  return apiRequest<UserProfileData>("/users/me", { token });
}

export function updateMe(
  token: string,
  input: UpdateProfileInput,
): Promise<UserProfileData> {
  return apiRequest<UserProfileData>("/users/me", {
    method: "PATCH",
    body: input,
    token,
  });
}
