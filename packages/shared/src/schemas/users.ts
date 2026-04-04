import { z } from "zod";
import type { UsersInsert } from "@repo/db";

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.string().optional(),
}) satisfies z.ZodType<Omit<UsersInsert, "id" | "createdAt">>;

export const getUserByEmailSchema = z.object({
  email: z.string().email(),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
