import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type ListMembershipStatus } from "@repo/shared";
import { timestamps } from "../_helpers";
import { contacts } from "./contacts";
import { contactLists } from "./contact-lists";
import { listConfirmTokens } from "./list-confirm-tokens";

export const listMembers = pgTable(
  "list_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id")
      .notNull()
      .references(() => contactLists.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    status: text("status").$type<ListMembershipStatus>().notNull().default("subscribed"),
    unsubscribedAt: timestamp("unsubscribed_at"),
    ...timestamps,
  },
  (t) => [
    index("list_members_list_id_idx").on(t.listId),
    index("list_members_contact_id_idx").on(t.contactId),
    unique("list_members_list_contact_unique").on(t.listId, t.contactId),
  ],
);

export const listMembersRelations = relations(listMembers, ({ one, many }) => ({
  list: one(contactLists, {
    fields: [listMembers.listId],
    references: [contactLists.id],
  }),
  contact: one(contacts, {
    fields: [listMembers.contactId],
    references: [contacts.id],
  }),
  confirmTokens: many(listConfirmTokens),
}));
