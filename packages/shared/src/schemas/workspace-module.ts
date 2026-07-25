import { z } from "zod";
import { sectionBlockSchema } from "./template/blocks/layout";

export const workspaceModuleSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(120),
  content: sectionBlockSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createWorkspaceModuleSchema = z.object({
  name: z.string().min(1).max(120),
  content: sectionBlockSchema,
});

export const updateWorkspaceModuleSchema = z
  .object({
    name: z.string().min(1).max(120),
    content: sectionBlockSchema,
  })
  .partial()
  .refine(
    (value) => value.name !== undefined || value.content !== undefined,
    { message: "At least one field is required" },
  );

export type WorkspaceModuleData = z.infer<typeof workspaceModuleSchema>;
export type CreateWorkspaceModuleInput = z.infer<
  typeof createWorkspaceModuleSchema
>;
export type UpdateWorkspaceModuleInput = z.infer<
  typeof updateWorkspaceModuleSchema
>;
