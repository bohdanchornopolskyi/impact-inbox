import { z } from "zod";

export const createAccountSchema = z.object({
  userId: z.string(),
  password: z.string().min(6).max(24),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
