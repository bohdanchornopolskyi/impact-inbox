import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type TemplateContentData } from "@repo/shared";
import { workspaces } from "./workspaces";
import { timestamps } from "./_helpers";

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: jsonb("content").$type<TemplateContentData>().notNull(),
    archivedAt: timestamp("archived_at"),
    ...timestamps,
  },
  (t) => [index("templates_workspace_id_idx").on(t.workspaceId)],
);

export const templatesRelations = relations(templates, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [templates.workspaceId],
    references: [workspaces.id],
  }),
}));
