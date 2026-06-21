import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
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

export const templateRevisions = pgTable(
  "template_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    content: jsonb("content").$type<TemplateContentData>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("template_revisions_template_id_idx").on(t.templateId)],
);

export const templatesRelations = relations(templates, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [templates.workspaceId],
    references: [workspaces.id],
  }),
  revisions: many(templateRevisions),
}));

export const templateRevisionsRelations = relations(
  templateRevisions,
  ({ one }) => ({
    template: one(templates, {
      fields: [templateRevisions.templateId],
      references: [templates.id],
    }),
  }),
);
