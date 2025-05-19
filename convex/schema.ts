import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  lists: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    description: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_and_name", ["ownerId", "name"]),

  contacts: defineTable({
    listId: v.id("lists"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(
      v.object({
        company: v.optional(v.string()),
        title: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),
  })
    .index("by_list", ["listId"])
    .index("by_list_and_email", ["listId", "email"]),

  emailTemplates: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    template: v.any(), // This allows for flexible JSON structure
  }).index("by_owner", ["ownerId"]),
};

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  ...applicationTables,
});
