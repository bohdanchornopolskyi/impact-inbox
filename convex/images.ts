import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendImage = mutation({
  args: { storageId: v.id("_storage"), name: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    await ctx.db.insert("images", {
      storageId: args.storageId,
      ownerId: userId,
      type: args.type,
      name: args.name,
    });
  },
});

export const listImages = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db
      .query("images")
      .filter((q) => q.eq(q.field("ownerId"), userId))
      .collect();
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const renameImage = mutation({
  args: { id: v.id("images"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }

    const image = await ctx.db.get(args.id);
    if (!image || image.ownerId !== userId) {
      throw new Error("Image not found or unauthorized");
    }

    await ctx.db.patch(args.id, { name: args.name });
  },
});

export const deleteImage = mutation({
  args: { id: v.id("images") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }

    const image = await ctx.db.get(args.id);
    if (!image || image.ownerId !== userId) {
      throw new Error("Image not found or unauthorized");
    }

    await ctx.storage.delete(image.storageId);
    await ctx.db.delete(args.id);
  },
});
