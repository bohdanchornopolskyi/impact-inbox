import { z } from "zod";

export const createSessionSchema = z.object({
  userId: z.string().min(1).max(255),
  token: z.string().min(1),
  ipAddress: z.string().min(1).max(255).optional(),
  expiresAt: z.date(),
});

export const updateSessionSchema = createSessionSchema.partial();

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
