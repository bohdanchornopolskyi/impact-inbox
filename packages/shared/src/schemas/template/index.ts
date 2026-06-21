import { z } from "zod";
import { queryBooleanSchema } from "../api-query";
import { templateContentSchema } from "./content";

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  content: templateContentSchema.optional(),
});

export const updateTemplateSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    content: templateContentSchema.optional(),
    archived: z.boolean().optional(),
    expectedUpdatedAt: z.string(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.content !== undefined ||
      value.archived !== undefined,
    { message: "At least one field is required" },
  );

export const listTemplatesQuerySchema = z.object({
  archived: queryBooleanSchema,
});

export const previewTemplateContentSchema = z.object({
  content: templateContentSchema,
});

export const templateSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string(),
  content: templateContentSchema,
  archivedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const templatePreviewSchema = z.object({
  html: z.string(),
  text: z.string(),
});

export {
  templateRevisionSchema,
  saveTemplateRevisionSchema,
  restoreTemplateRevisionSchema,
  type TemplateRevisionData,
  type SaveTemplateRevisionInput,
  type RestoreTemplateRevisionInput,
} from "./revisions";

export {
  templateExportSchema,
  type TemplateExportData,
} from "./export";

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
  blockAlignSchema,
  blockStylesSchema,
  type Spacing,
  type BorderStyle,
  type TextAlign,
  type VerticalAlign,
  type BlockAlign,
  type BlockStyles,
} from "./styles";

export * from "./blocks";
