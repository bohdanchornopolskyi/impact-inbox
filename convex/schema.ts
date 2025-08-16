// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// ==================================================================
//  Validators
//  We define all validators first for clarity and reusability.
// ==================================================================

/**
 * Validator for the shared 'styles' object used by all blocks.
 */
const stylesValidator = v.object({
  // Layout & Spacing
  paddingTop: v.optional(v.number()),
  paddingBottom: v.optional(v.number()),
  paddingLeft: v.optional(v.number()),
  paddingRight: v.optional(v.number()),
  marginTop: v.optional(v.number()),
  marginBottom: v.optional(v.number()),
  // Background & Borders
  backgroundColor: v.optional(v.string()),
  borderWidth: v.optional(v.number()),
  borderStyle: v.optional(
    v.union(v.literal("solid"), v.literal("dotted"), v.literal("dashed")),
  ),
  borderColor: v.optional(v.string()),
  borderRadius: v.optional(v.number()),
  // Typography
  fontFamily: v.optional(v.string()),
  fontSize: v.optional(v.number()),
  fontWeight: v.optional(v.union(v.literal("normal"), v.literal("bold"))),
  lineHeight: v.optional(v.number()),
  letterSpacing: v.optional(v.number()),
  color: v.optional(v.string()),
  textAlign: v.optional(
    v.union(v.literal("left"), v.literal("center"), v.literal("right")),
  ),
  textDecoration: v.optional(
    v.union(
      v.literal("none"),
      v.literal("underline"),
      v.literal("line-through"),
    ),
  ),
  // Sizing & Alignment
  widthMode: v.optional(v.union(v.literal("fill"), v.literal("fixed"))),
  widthPx: v.optional(v.number()),
  heightMode: v.optional(v.union(v.literal("fill"), v.literal("fixed"))),
  heightPx: v.optional(v.number()),
  alignment: v.optional(
    v.union(v.literal("left"), v.literal("center"), v.literal("right")),
  ),
  // List Specific
  listType: v.optional(v.union(v.literal("unordered"), v.literal("ordered"))),
  listStyleType: v.optional(
    v.union(
      v.literal("disc"),
      v.literal("circle"),
      v.literal("square"),
      v.literal("decimal"),
      v.literal("lower-alpha"),
      v.literal("upper-alpha"),
      v.literal("lower-roman"),
      v.literal("upper-roman"),
    ),
  ),
  itemSpacing: v.optional(v.number()),
  markerColor: v.optional(v.string()),
});

/**
 * Base validator for fields common to all blocks.
 */
const baseBlockValidator = {
  id: v.string(),
  name: v.string(),
  parentId: v.string(), // Required parentId for the flat tree structure
  styles: stylesValidator,
};

/**
 * Validator for the recursive 'AnyBlock' structure.
 * This is the core validator for your email template content.
 */
export const anyBlockValidator = v.union(
  v.object({
    ...baseBlockValidator,
    type: v.literal("container"),
  }),
  v.object({
    ...baseBlockValidator,
    type: v.literal("text"),
    content: v.string(),
  }),
  v.object({
    ...baseBlockValidator,
    type: v.literal("button"),
    content: v.string(),
    href: v.string(),
  }),
  v.object({
    ...baseBlockValidator,
    type: v.literal("image"),
    src: v.string(),
    alt: v.string(),
    href: v.optional(v.string()),
  }),
  // v.object({
  //   ...baseBlockValidator,
  //   type: v.literal("list"),
  //   items: v.array(v.string()),
  // }),
);

/**
 * Validator for the 'HistoryAction' structure, covering all possible user actions.
 */
export const historyActionValidator = v.union(
  // Add Block Action
  v.object({
    type: v.literal("ADD_BLOCK"),
    payload: v.object({
      block: anyBlockValidator,
      parentId: v.string(),
      index: v.number(),
    }),
  }),
  // Update Style Action
  v.object({
    type: v.literal("UPDATE_STYLE"),
    payload: v.object({
      blockId: v.string(),
      styles: stylesValidator, // Re-use the styles validator
    }),
  }),
  // Update Content Action
  v.object({
    type: v.literal("UPDATE_CONTENT"),
    payload: v.object({
      blockId: v.string(),
      content: v.union(
        v.object({ content: v.optional(v.string()) }),
        v.object({
          content: v.optional(v.string()),
          href: v.optional(v.string()),
        }),
        v.object({
          src: v.optional(v.string()),
          alt: v.optional(v.string()),
          href: v.optional(v.string()),
        }),
        v.object({ items: v.optional(v.array(v.string())) }),
      ),
    }),
  }),
  // Delete Block Action
  v.object({
    type: v.literal("DELETE_BLOCK"),
    payload: v.object({ blockId: v.string() }),
  }),
  // Move Block Action (Re-added for completeness)
  v.object({
    type: v.literal("MOVE_BLOCK"),
    payload: v.object({
      blockId: v.string(),
      newParentId: v.string(),
      newIndex: v.number(),
    }),
  }),
);

// ==================================================================
//  Table Definitions
// ==================================================================

export default defineSchema({
  // Keep the auth tables from your original schema
  ...authTables,

  // Keep other tables like lists and contacts
  lists: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    description: v.optional(v.string()),
  }).index("by_owner", ["ownerId"]),

  contacts: defineTable({
    listId: v.id("lists"),
    name: v.string(),
    email: v.string(),
  }).index("by_list", ["listId"]),

  /**
   * Main table for email templates. The `content` field now uses
   * our strong validator instead of `v.any()`.
   */
  emailTemplates: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    // The content of the template, strongly typed. Optional for new templates.
    content: v.optional(v.array(anyBlockValidator)),
  }).index("by_owner", ["ownerId"]),

  /**
   * Stores full snapshots of a template's content, acting as a base
   * for the history of changes.
   */
  templateSnapshots: defineTable({
    templateId: v.id("emailTemplates"),
    // Stores the full block array for a base version
    content: v.array(anyBlockValidator),
    version: v.number(),
    createdAt: v.number(),
  }).index("by_template", ["templateId"]),

  /**
   * Stores the individual user actions (commands) performed on a snapshot.
   * This creates a lightweight, auditable history log.
   */
  templateActions: defineTable({
    snapshotId: v.id("templateSnapshots"),
    // Stores the specific action object
    action: historyActionValidator,
    authorId: v.id("users"),
    timestamp: v.number(),
  }).index("by_snapshot", ["snapshotId"]),
});
