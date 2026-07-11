import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspaces } from "../workspace/workspaces";
import { timestamps } from "../_helpers";
import { listMembers } from "./list-members";

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default({}),
    globalUnsubscribedAt: timestamp("global_unsubscribed_at"),
    suppressedAt: timestamp("suppressed_at"),
    ...timestamps,
  },
  (t) => [
    index("contacts_workspace_id_idx").on(t.workspaceId),
    unique("contacts_workspace_email_unique").on(t.workspaceId, t.email),
  ],
);

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [contacts.workspaceId],
    references: [workspaces.id],
  }),
  listMemberships: many(listMembers),
}));
