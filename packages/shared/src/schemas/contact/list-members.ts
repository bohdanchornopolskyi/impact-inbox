import { z } from "zod";
import { listMembershipStatusSchema } from "./contacts";

export const listMemberSchema = z.object({
  id: z.string().uuid(),
  listId: z.string().uuid(),
  contactId: z.string().uuid(),
  status: listMembershipStatusSchema,
  unsubscribedAt: z.coerce.date().nullable(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  globalUnsubscribedAt: z.coerce.date().nullable(),
  suppressedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const addListMemberSchema = z
  .object({
    contactId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    firstName: z.string().max(255).optional(),
    lastName: z.string().max(255).optional(),
  })
  .refine((value) => Boolean(value.contactId || value.email), {
    message: "contactId or email is required",
  });

export const updateListMemberStatusSchema = z.object({
  status: listMembershipStatusSchema.exclude(["pending"]),
});

export type ListMemberData = z.infer<typeof listMemberSchema>;
export type AddListMemberInput = z.infer<typeof addListMemberSchema>;
export type UpdateListMemberStatusInput = z.infer<
  typeof updateListMemberStatusSchema
>;
