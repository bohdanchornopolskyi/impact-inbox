import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  type ContactImportErrorData,
  type ContactImportStatus,
  type ImportColumnMapping,
  type ListMembershipStatus,
} from "@repo/shared";
import { workspaces } from "./workspaces";
import { users } from "./users";
import { timestamps } from "./_helpers";

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

export const contactLists = pgTable(
  "contact_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    doubleOptInEnabled: boolean("double_opt_in_enabled").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("contact_lists_workspace_id_idx").on(t.workspaceId)],
);

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

export const listConfirmTokens = pgTable(
  "list_confirm_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listMemberId: uuid("list_member_id")
      .notNull()
      .references(() => listMembers.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("list_confirm_tokens_token_idx").on(t.token)],
);

export const contactImports = pgTable(
  "contact_imports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    listId: uuid("list_id")
      .notNull()
      .references(() => contactLists.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").$type<ContactImportStatus>().notNull().default("pending_confirmation"),
    columnMapping: jsonb("column_mapping").$type<ImportColumnMapping | null>(),
    parsedRows: jsonb("parsed_rows").$type<Record<string, string>[]>().notNull().default([]),
    processedCount: integer("processed_count").notNull().default(0),
    createdCount: integer("created_count").notNull().default(0),
    updatedCount: integer("updated_count").notNull().default(0),
    errorLog: jsonb("error_log").$type<ContactImportErrorData[]>().notNull().default([]),
    ...timestamps,
  },
  (t) => [index("contact_imports_workspace_id_idx").on(t.workspaceId)],
);

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [contacts.workspaceId],
    references: [workspaces.id],
  }),
  listMemberships: many(listMembers),
}));

export const contactListsRelations = relations(contactLists, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [contactLists.workspaceId],
    references: [workspaces.id],
  }),
  members: many(listMembers),
  imports: many(contactImports),
}));

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

export const listConfirmTokensRelations = relations(
  listConfirmTokens,
  ({ one }) => ({
    listMember: one(listMembers, {
      fields: [listConfirmTokens.listMemberId],
      references: [listMembers.id],
    }),
  }),
);

export const contactImportsRelations = relations(contactImports, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [contactImports.workspaceId],
    references: [workspaces.id],
  }),
  list: one(contactLists, {
    fields: [contactImports.listId],
    references: [contactLists.id],
  }),
  createdBy: one(users, {
    fields: [contactImports.createdByUserId],
    references: [users.id],
  }),
}));
