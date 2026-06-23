import { z } from "zod";
import {
  CONTACT_ATTRIBUTE_KEY_PATTERN,
  LIST_MEMBERSHIP_STATUSES,
} from "../../constants/contact";

export const listMembershipStatusSchema = z.enum(LIST_MEMBERSHIP_STATUSES);

export const contactAttributesSchema = z.record(z.string(), z.string());

export const contactSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  attributes: contactAttributesSchema,
  globalUnsubscribedAt: z.coerce.date().nullable(),
  suppressedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const contactListMembershipSchema = z.object({
  listId: z.string().uuid(),
  listName: z.string(),
  status: listMembershipStatusSchema,
  unsubscribedAt: z.coerce.date().nullable(),
});

export const contactDetailSchema = contactSchema.extend({
  listMemberships: z.array(contactListMembershipSchema),
});

export const createContactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
  attributes: contactAttributesSchema.optional(),
  listId: z.string().uuid().optional(),
});

export const updateContactSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string().max(255).nullable(),
    lastName: z.string().max(255).nullable(),
    attributes: contactAttributesSchema,
    globalUnsubscribed: z.boolean(),
  })
  .partial()
  .refine(
    (value) =>
      value.email !== undefined ||
      value.firstName !== undefined ||
      value.lastName !== undefined ||
      value.attributes !== undefined ||
      value.globalUnsubscribed !== undefined,
    { message: "At least one field is required" },
  )
  .superRefine((value, ctx) => {
    if (!value.attributes) {
      return;
    }
    for (const key of Object.keys(value.attributes)) {
      if (!CONTACT_ATTRIBUTE_KEY_PATTERN.test(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid attribute key: ${key}`,
          path: ["attributes", key],
        });
      }
    }
  });

export const listContactsQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const contactAttributeKeysSchema = z.object({
  keys: z.array(z.string()),
});

export type ContactData = z.infer<typeof contactSchema>;
export type ContactDetailData = z.infer<typeof contactDetailSchema>;
export type ContactListMembershipData = z.infer<
  typeof contactListMembershipSchema
>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
export type ContactAttributeKeysData = z.infer<
  typeof contactAttributeKeysSchema
>;
