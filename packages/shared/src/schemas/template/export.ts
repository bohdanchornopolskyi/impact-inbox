import { z } from "zod";

export const templateExportSchema = z.object({
  html: z.string(),
  text: z.string(),
  fileName: z.string(),
});

export type TemplateExportData = z.infer<typeof templateExportSchema>;
