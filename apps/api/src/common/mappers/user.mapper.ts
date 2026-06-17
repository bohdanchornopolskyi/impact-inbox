import { type UsersSelect } from "@repo/db";
import { type UserProfileData } from "@repo/shared";

export function toUserProfile(row: UsersSelect): UserProfileData {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    emailVerifiedAt: row.emailVerifiedAt,
  };
}
