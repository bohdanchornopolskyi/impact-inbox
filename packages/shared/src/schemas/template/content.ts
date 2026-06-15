import { z } from "zod";
import { sectionBlockSchema } from "./blocks/layout";
import { templateSettingsSchema } from "./settings";

export const templateContentSchema = z
  .object({
    version: z.literal(1),
    settings: templateSettingsSchema.default({ width: 600 }),
    body: z.array(sectionBlockSchema),
  })
  .strict();

export type TemplateContentData = z.infer<typeof templateContentSchema>;
