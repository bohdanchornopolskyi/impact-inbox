import { z } from "zod";

export const templateSettingsSchema = z
  .object({
    preheader: z.string().max(500).optional(),
    width: z.number().min(320).max(900).default(600),
    backgroundColor: z.string().optional(),
    contentBackgroundColor: z.string().optional(),
    fontFamily: z.string().max(255).optional(),
    fontSize: z.number().min(8).max(72).optional(),
    lineHeight: z.number().min(1).max(3).optional(),
    linkColor: z.string().optional(),
    textColor: z.string().optional(),
  })
  .strict();

export type TemplateSettings = z.infer<typeof templateSettingsSchema>;
