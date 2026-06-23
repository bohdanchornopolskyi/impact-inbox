import { z } from "zod";

export const IMPORT_CONTACTS_JOB = "import-contacts" as const;

export const importContactsPayloadSchema = z.object({
  importId: z.string().uuid(),
});

export type ImportContactsPayload = z.infer<typeof importContactsPayloadSchema>;
