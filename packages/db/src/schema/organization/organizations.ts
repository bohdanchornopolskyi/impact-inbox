import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type PlanTier } from "@repo/shared";
import { timestamps } from "../_helpers";
import { organizationMembers } from "./organization-members";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  planTier: text("plan_tier").$type<PlanTier | null>(),
  trialEndsAt: timestamp("trial_ends_at"),
  ...timestamps,
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
}));
