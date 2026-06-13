import { z } from "zod";
import { TEMPLATE_STATUSES } from "../constants";

export const templateStatusSchema = z.enum(TEMPLATE_STATUSES);

export const templateBlockSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.unknown()),
});

export const templateContentSchema = z.object({
  version: z.literal(1),
  blocks: z.array(templateBlockSchema),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  content: templateContentSchema.optional(),
  status: templateStatusSchema.optional(),
});

export const updateTemplateSchema = z
  .object({
    name: z.string().min(1).max(255),
    content: templateContentSchema,
    status: templateStatusSchema,
  })
  .partial()
  .refine(
    (value) =>
      value.name !== undefined ||
      value.content !== undefined ||
      value.status !== undefined,
    { message: "At least one field is required" },
  );

export const listTemplatesQuerySchema = z.object({
  status: templateStatusSchema.optional(),
});

export const previewTemplateContentSchema = z.object({
  content: templateContentSchema,
});

export const templateSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string(),
  content: templateContentSchema,
  status: templateStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const templatePreviewSchema = z.object({
  html: z.string(),
  text: z.string(),
});

export type TemplateStatus = z.infer<typeof templateStatusSchema>;
export type TemplateBlockData = z.infer<typeof templateBlockSchema>;
export type TemplateContentData = z.infer<typeof templateContentSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;
export type PreviewTemplateContentInput = z.infer<
  typeof previewTemplateContentSchema
>;
export type TemplateData = z.infer<typeof templateSchema>;
export type TemplatePreviewData = z.infer<typeof templatePreviewSchema>;
