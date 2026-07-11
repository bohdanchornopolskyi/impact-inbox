import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { type OrganizationRole, type WorkspaceRole } from "@repo/shared";
import { users } from "../auth/users";
import { workspaces } from "../workspace/workspaces";
import { organizations } from "./organizations";

export const invites = pgTable(
  "invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: uuid("token").notNull().unique().defaultRandom(),
    email: text("email").notNull(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    organizationRole: text("organization_role")
      .$type<OrganizationRole>()
      .notNull()
      .default("member"),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    workspaceRole: text("workspace_role").$type<WorkspaceRole>(),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("invites_organization_id_idx").on(t.organizationId),
    index("invites_workspace_id_idx").on(t.workspaceId),
    index("invites_token_idx").on(t.token),
    uniqueIndex("invites_organization_email_pending_unique")
      .on(t.organizationId, t.email)
      .where(sql`${t.acceptedAt} IS NULL AND ${t.revokedAt} IS NULL`),
  ],
);

export const invitesRelations = relations(invites, ({ one }) => ({
  organization: one(organizations, {
    fields: [invites.organizationId],
    references: [organizations.id],
  }),
  workspace: one(workspaces, {
    fields: [invites.workspaceId],
    references: [workspaces.id],
  }),
  invitedBy: one(users, {
    fields: [invites.invitedByUserId],
    references: [users.id],
  }),
}));
