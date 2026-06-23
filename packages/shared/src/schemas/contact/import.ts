import { z } from "zod";
import { CONTACT_IMPORT_STATUSES } from "../../constants/contact";

export const importColumnMappingSchema = z.object({
  email: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});

export const importPreviewResponseSchema = z.object({
  importId: z.string().uuid(),
  headers: z.array(z.string()),
  sampleRows: z.array(z.record(z.string(), z.string())),
  suggestedMapping: importColumnMappingSchema,
  rowCount: z.number().int().nonnegative(),
});

export const executeImportSchema = z.object({
  columnMapping: importColumnMappingSchema,
});

export const contactImportErrorSchema = z.object({
  row: z.number().int().positive(),
  message: z.string(),
});

export const contactImportJobSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  listId: z.string().uuid(),
  status: z.enum(CONTACT_IMPORT_STATUSES),
  rowCount: z.number().int().nonnegative(),
  processedCount: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  updatedCount: z.number().int().nonnegative(),
  errors: z.array(contactImportErrorSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ImportColumnMapping = z.infer<typeof importColumnMappingSchema>;
export type ImportPreviewResponseData = z.infer<
  typeof importPreviewResponseSchema
>;
export type ExecuteImportInput = z.infer<typeof executeImportSchema>;
export type ContactImportErrorData = z.infer<typeof contactImportErrorSchema>;
export type ContactImportJobData = z.infer<typeof contactImportJobSchema>;
