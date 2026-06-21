import { z } from "zod";
import { templateContentSchema } from "./content";

export const templateRevisionSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  content: templateContentSchema,
  createdAt: z.coerce.date(),
});

export type TemplateRevisionData = z.infer<typeof templateRevisionSchema>;

/**
 * Explicit Save: persists the working-copy `content` and snapshots a revision
 * in one transaction, guarded on the last-known `updatedAt` (ADR 0010).
 */
export const saveTemplateRevisionSchema = z.object({
  content: templateContentSchema,
  expectedUpdatedAt: z.string(),
});

export type SaveTemplateRevisionInput = z.infer<
  typeof saveTemplateRevisionSchema
>;

/**
 * Restore-revision: rolls the working copy back to a revision, guarded on the
 * last-known `updatedAt` (ADR 0010).
 */
export const restoreTemplateRevisionSchema = z.object({
  expectedUpdatedAt: z.string(),
});

export type RestoreTemplateRevisionInput = z.infer<
  typeof restoreTemplateRevisionSchema
>;
