import { pgTable, uuid, text, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type OrganizationRole } from "@repo/shared";
import { users } from "../auth/users";
import { organizations } from "./organizations";

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<OrganizationRole>().notNull().default("member"),
  },
  (t) => [
    index("organization_members_organization_id_idx").on(t.organizationId),
    index("organization_members_user_id_idx").on(t.userId),
    unique("organization_members_organization_user_unique").on(
      t.organizationId,
      t.userId,
    ),
  ],
);

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  }),
);
