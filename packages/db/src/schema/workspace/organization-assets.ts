import {
  pgTable,
  uuid,
  text,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timestamps } from "../_helpers";
import { organizations } from "../organization/organizations";
import { users } from "../auth/users";
import { workspaces } from "./workspaces";

export const organizationAssets = pgTable(
  "organization_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    ...timestamps,
  },
  (table) => [
    index("organization_assets_organization_id_idx").on(table.organizationId),
    index("organization_assets_workspace_id_idx").on(table.workspaceId),
  ],
);

export const organizationAssetsRelations = relations(
  organizationAssets,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationAssets.organizationId],
      references: [organizations.id],
    }),
    workspace: one(workspaces, {
      fields: [organizationAssets.workspaceId],
      references: [workspaces.id],
    }),
    createdBy: one(users, {
      fields: [organizationAssets.createdByUserId],
      references: [users.id],
    }),
  }),
);
