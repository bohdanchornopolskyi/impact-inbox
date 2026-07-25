import {
  pgTable,
  uuid,
  text,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { SectionBlock } from "@repo/shared";
import { timestamps } from "../_helpers";
import { workspaces } from "./workspaces";

export const workspaceModules = pgTable(
  "workspace_modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: jsonb("content").$type<SectionBlock>().notNull(),
    ...timestamps,
  },
  (table) => [index("workspace_modules_workspace_id_idx").on(table.workspaceId)],
);

export const workspaceModulesRelations = relations(
  workspaceModules,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceModules.workspaceId],
      references: [workspaces.id],
    }),
  }),
);
