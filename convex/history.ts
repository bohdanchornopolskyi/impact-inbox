import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { anyBlockValidator, historyActionValidator } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Creates a new base snapshot for a template's version history.
 * This should be called when a user starts a new editing session.
 */
export const createSnapshot = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    content: v.array(anyBlockValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const template = await ctx.db.get(args.templateId);

    if (!template || template.ownerId !== userId) {
      throw new Error("You do not have permission to modify this template.");
    }

    const snapshotId = await ctx.db.insert("templateSnapshots", {
      templateId: args.templateId,
      content: args.content,
      version: 1, // Or a dynamic version number
      createdAt: Date.now(),
    });

    return snapshotId;
  },
});

/**
 * Saves a single user action (command) to a snapshot's history log.
 * This is called for every change made in the editor.
 */
export const saveAction = mutation({
  args: {
    snapshotId: v.id("templateSnapshots"),
    action: historyActionValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User not found.");
    }

    await ctx.db.insert("templateActions", {
      snapshotId: args.snapshotId,
      action: args.action,
      authorId: userId,
      timestamp: Date.now(),
    });
  },
});
