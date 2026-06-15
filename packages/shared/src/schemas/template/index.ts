import { z } from "zod";
import { TEMPLATE_STATUSES } from "../../constants";
import { templateContentSchema } from "./content";

export const templateStatusSchema = z.enum(TEMPLATE_STATUSES);

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
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;
export type PreviewTemplateContentInput = z.infer<
  typeof previewTemplateContentSchema
>;
export type TemplateData = z.infer<typeof templateSchema>;
export type TemplatePreviewData = z.infer<typeof templatePreviewSchema>;

export {
  templateContentSchema,
  type TemplateContentData,
} from "./content";

export {
  templateSettingsSchema,
  type TemplateSettings,
} from "./settings";

export {
  spacingSchema,
  borderStyleSchema,
  textAlignSchema,
  verticalAlignSchema,
  blockStylesSchema,
  type Spacing,
  type BorderStyle,
  type TextAlign,
  type VerticalAlign,
  type BlockStyles,
} from "./styles";

export * from "./blocks";
