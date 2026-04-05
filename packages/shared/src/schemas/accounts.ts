import { z } from "zod";

export const createAccountSchema = z.object({
  userId: z.string(),
  password: z.string().email(),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
