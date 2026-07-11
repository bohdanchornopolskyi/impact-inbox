import { pgTable, uuid, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type TemplateContentData } from "@repo/shared";
import { templates } from "./templates";

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

export const templateRevisionsRelations = relations(
  templateRevisions,
  ({ one }) => ({
    template: one(templates, {
      fields: [templateRevisions.templateId],
      references: [templates.id],
    }),
  }),
);
