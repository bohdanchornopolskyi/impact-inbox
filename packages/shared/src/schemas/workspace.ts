import { z } from "zod";
import { WORKSPACE_ROLES } from "../constants";

export const workspaceRoleSchema = z.enum(WORKSPACE_ROLES);

export const workspaceSlugSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: workspaceSlugSchema.optional(),
});

export const updateWorkspaceSchema = z
  .object({
    name: z.string().min(1).max(255),
    slug: workspaceSlugSchema,
  })
  .partial()
  .refine((value) => value.name !== undefined || value.slug !== undefined, {
    message: "At least one field is required",
  });

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: workspaceRoleSchema
    .exclude(["owner"])
    .optional()
    .default("member"),
});

export const listWorkspacesQuerySchema = z.object({});

export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const workspaceMemberSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: workspaceRoleSchema,
});

export const workspaceListItemSchema = workspaceSchema.extend({
  role: workspaceRoleSchema,
});

export const workspaceDetailSchema = workspaceSchema.extend({
  role: workspaceRoleSchema,
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ListWorkspacesQuery = z.infer<typeof listWorkspacesQuerySchema>;
export type WorkspaceData = z.infer<typeof workspaceSchema>;
export type WorkspaceMemberData = z.infer<typeof workspaceMemberSchema>;
export type WorkspaceListItemData = z.infer<typeof workspaceListItemSchema>;
export type WorkspaceDetailData = z.infer<typeof workspaceDetailSchema>;
