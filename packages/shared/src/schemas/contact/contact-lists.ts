import { z } from "zod";

export const contactListSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string(),
  doubleOptInEnabled: z.boolean(),
  memberCount: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createContactListSchema = z.object({
  name: z.string().min(1).max(255),
  doubleOptInEnabled: z.boolean().optional(),
});

export const updateContactListSchema = z
  .object({
    name: z.string().min(1).max(255),
    doubleOptInEnabled: z.boolean(),
  })
  .partial()
  .refine(
    (value) =>
      value.name !== undefined || value.doubleOptInEnabled !== undefined,
    { message: "At least one field is required" },
  );

export type ContactListData = z.infer<typeof contactListSchema>;
export type CreateContactListInput = z.infer<typeof createContactListSchema>;
export type UpdateContactListInput = z.infer<typeof updateContactListSchema>;
