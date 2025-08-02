import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { anyBlockValidator } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";

import { createContainerBlock } from "../lib/blockFactory";

/**
 * Creates a new, empty email template for the logged-in user.
 */
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User not found.");
    }

    const content = [createContainerBlock()];

    const newTemplateId = await ctx.db.insert("emailTemplates", {
      name: args.name,
      ownerId: userId,
      content,
    });

    return newTemplateId;
  },
});

/**
 * Gets a single email template by its ID.
 * Ensures that only the owner of the template can access it.
 */
export const getById = query({
  args: {
    templateId: v.id("emailTemplates"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const template = await ctx.db.get(args.templateId);

    if (!template) {
      return null;
    }

    // Security: Only return the template if the user is the owner.
    if (template.ownerId !== userId) {
      return null;
    }

    return template;
  },
});

/**
 * Updates the content (the array of blocks) for a specific template.
 */
export const updateContent = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    // Validate the content against the schema's anyBlockValidator
    content: v.array(anyBlockValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const template = await ctx.db.get(args.templateId);

    if (!template) {
      throw new Error("Template not found.");
    }

    // Security: Prevent users from updating templates they don't own.
    if (template.ownerId !== identity?.subject) {
      throw new Error("You do not have permission to edit this template.");
    }

    // Update just the content field of the document
    await ctx.db.patch(args.templateId, {
      content: args.content,
    });
  },
});

/**
 * Get all templates for the logged-in user.
 */
export const getAll = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("emailTemplates")
      .filter((q) => q.eq(q.field("ownerId"), userId))
      .collect();
  },
});
