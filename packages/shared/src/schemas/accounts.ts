import { z } from "zod";
import type { AccountsInsert } from "@repo/db";

export const createAccountSchema = z.object({
  userId: z.string(),
  password: z.string().email(),
}) satisfies z.ZodType<Omit<AccountsInsert, "id" | "createdAt">>;

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
