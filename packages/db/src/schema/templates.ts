import { pgTable, uuid, text, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type TemplateContentData, type TemplateStatus } from "@repo/shared";
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
    status: text("status").$type<TemplateStatus>().notNull().default("draft"),
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
