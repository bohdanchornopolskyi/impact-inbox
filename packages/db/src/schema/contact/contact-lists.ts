import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspaces } from "../workspace/workspaces";
import { timestamps } from "../_helpers";
import { listMembers } from "./list-members";
import { contactImports } from "./contact-imports";

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

export const contactListsRelations = relations(contactLists, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [contactLists.workspaceId],
    references: [workspaces.id],
  }),
  members: many(listMembers),
  imports: many(contactImports),
}));
