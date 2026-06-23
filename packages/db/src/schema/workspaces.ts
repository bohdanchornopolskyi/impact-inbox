import { pgTable, uuid, index, text, unique, jsonb } from "drizzle-orm/pg-core";
import { type PhysicalAddressData } from "@repo/shared";
import { relations } from "drizzle-orm";
import { type WorkspaceRole } from "@repo/shared";
import { organizations } from "./organizations";
import { users } from "./users";
import { templates } from "./template";
import {
  contacts,
  contactLists,
  contactImports,
} from "./contacts";
import { timestamps } from "./_helpers";

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  physicalAddress: jsonb("physical_address").$type<PhysicalAddressData>(),
  ...timestamps,
});

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [workspaces.organizationId],
    references: [organizations.id],
  }),
  members: many(workspaceMembers),
  templates: many(templates),
  contacts: many(contacts),
  contactLists: many(contactLists),
  contactImports: many(contactImports),
}));

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<WorkspaceRole>().notNull().default("member"),
  },
  (t) => [
    index("workspace_members_workspace_id_idx").on(t.workspaceId),
    index("workspace_members_user_id_idx").on(t.userId),
    unique("workspace_members_workspace_user_unique").on(
      t.workspaceId,
      t.userId,
    ),
  ],
);

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceMembers.userId],
      references: [users.id],
    }),
  }),
);
