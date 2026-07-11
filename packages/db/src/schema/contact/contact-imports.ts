import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  type ContactImportErrorData,
  type ContactImportStatus,
  type ImportColumnMapping,
} from "@repo/shared";
import { users } from "../auth/users";
import { workspaces } from "../workspace/workspaces";
import { timestamps } from "../_helpers";
import { contactLists } from "./contact-lists";

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
