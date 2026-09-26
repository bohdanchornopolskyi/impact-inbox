import { z } from "zod";

export const templateSettingsSchema = z
  .object({
    subject: z.string().max(998).optional(),
    preheader: z.string().max(500).optional(),
    width: z.number().min(480).max(700).default(600),
    backgroundColor: z.string().optional(),
    contentBackgroundColor: z.string().optional(),
    fontFamily: z.string().max(255).optional(),
    fontSize: z.number().min(8).max(72).optional(),
    lineHeight: z.number().min(1).max(3).optional(),
    linkColor: z.string().optional(),
    textColor: z.string().optional(),
    contentRadius: z.number().min(0).max(40).optional(),
    headingFontFamily: z.string().max(255).optional(),
    linkUnderline: z.enum(["always", "hover", "never"]).optional(),
    buttonStyle: z.enum(["filled", "outline"]).optional(),
    buttonRadius: z.number().min(0).max(40).optional(),
    fromName: z.string().max(255).optional(),
    fromEmail: z.string().max(255).optional(),
    replyTo: z.string().max(255).optional(),
    trackOpens: z.boolean().optional(),
    trackClicks: z.boolean().optional(),
    utmEnabled: z.boolean().optional(),
    utmCampaign: z.string().max(255).optional(),
    unsubscribeInFooter: z.boolean().optional(),
    autoPlainText: z.boolean().optional(),
  })
  .strict();

export type TemplateSettings = z.infer<typeof templateSettingsSchema>;
