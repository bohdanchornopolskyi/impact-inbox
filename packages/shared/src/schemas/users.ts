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

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
