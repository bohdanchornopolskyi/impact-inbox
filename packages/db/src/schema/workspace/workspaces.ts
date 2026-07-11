import { pgTable, uuid, index, text, unique, jsonb } from "drizzle-orm/pg-core";
import { type PhysicalAddressData } from "@repo/shared";
import { relations } from "drizzle-orm";
import { organizations } from "../organization/organizations";
import { templates } from "../template/templates";
import { contacts } from "../contact/contacts";
import { contactLists } from "../contact/contact-lists";
import { contactImports } from "../contact/contact-imports";
import { timestamps } from "../_helpers";
import { workspaceMembers } from "./workspace-members";

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
