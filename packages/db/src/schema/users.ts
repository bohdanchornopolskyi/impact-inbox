import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizationMembers } from "./organizations";
import { workspaceMembers } from "./workspaces";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().unique().notNull(),
  name: text().notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMembers),
  workspaceMemberships: many(workspaceMembers),
}));
