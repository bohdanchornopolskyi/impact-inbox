import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.string().optional(),
});

export const getUserByEmailSchema = z.object({
  email: z.string().email(),
});

export const updateUserSchema = createUserSchema.partial();

export const updateProfileSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
  })
  .refine((value) => value.name !== undefined || value.email !== undefined, {
    message: "At least one field is required",
  });

export const deleteAccountSchema = z.object({
  password: z.string(),
});

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  emailVerifiedAt: z.coerce.date().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
