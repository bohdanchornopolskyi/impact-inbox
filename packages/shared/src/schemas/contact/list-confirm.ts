import { z } from "zod";

export const listConfirmPreviewSchema = z.object({
  listName: z.string(),
  workspaceName: z.string(),
  emailMasked: z.string(),
  expired: z.boolean(),
  alreadyUsed: z.boolean(),
});

export const listConfirmAcceptSchema = z.object({
  token: z.string().min(1),
});

export type ListConfirmPreviewData = z.infer<typeof listConfirmPreviewSchema>;
export type ListConfirmAcceptInput = z.infer<typeof listConfirmAcceptSchema>;
