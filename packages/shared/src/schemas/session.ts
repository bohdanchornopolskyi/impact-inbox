import { z } from "zod";
import type { SessionsInsert } from "@repo/db";

export const createSessionSchema = z.object({
  userId: z.string().min(1).max(255),
  token: z.string(),
  ipAddress: z.string().min(1).max(255).optional(),
  expiresAt: z.date(),
}) satisfies z.ZodType<Omit<SessionsInsert, "id" | "createdAt">>;

export const updateSessionSchema = createSessionSchema.partial();

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
