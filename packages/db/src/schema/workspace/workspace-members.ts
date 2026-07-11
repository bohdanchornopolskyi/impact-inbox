import { pgTable, uuid, index, text, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type WorkspaceRole } from "@repo/shared";
import { users } from "../auth/users";
import { workspaces } from "./workspaces";

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
