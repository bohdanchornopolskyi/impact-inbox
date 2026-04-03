import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspaceMembers, workspaces } from "./workspaces";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().unique().notNull(),
  name: text().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
}));
