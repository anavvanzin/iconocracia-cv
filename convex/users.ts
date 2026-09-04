import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrNull } from "./lib/auth";
import {
  adminMutation,
  adminQuery,
  authedMutation,
} from "./lib/customFunctions";
import { isAdminRole } from "./lib/roles";
import { publicUserValidator, toPublicUser } from "./lib/validators";
import { paginationOptsValidator } from "convex/server";

export const viewer = query({
  args: {},
  returns: v.union(publicUserValidator, v.null()),
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    return user ? toPublicUser(user) : null;
  },
});

export const storeUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await getCurrentUser(ctx);
    const now = Date.now();
    let role = user.role ?? "user";
    if (!isAdminRole(role)) {
      const existingAdmin = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .first();
      if (existingAdmin === null) {
        role = "admin";
      }
    }

    await ctx.db.patch("users", user._id, {
      updatedAt: now,
      createdAt: user.createdAt ?? now,
      role,
      tokenIdentifier: user.tokenIdentifier ?? identity.tokenIdentifier,
      email: user.email ?? identity.email ?? undefined,
      name: user.name ?? identity.name ?? undefined,
      image: user.image ?? identity.pictureUrl ?? undefined,
    });

    return user._id;
  },
});

export const updateProfile = authedMutation({
  args: {
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (name.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    if (name.length > 100) {
      throw new Error("Name must be less than 100 characters");
    }

    await ctx.db.patch("users", ctx.user._id, {
      name,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const listUsers = adminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(publicUserValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("users")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      page: results.page.map(toPublicUser),
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

export const setUserRole = adminMutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.userId === ctx.user._id && args.role !== "admin") {
      throw new Error("Admins cannot remove their own admin role");
    }

    const target = await ctx.db.get("users", args.userId);
    if (!target) {
      throw new Error("User not found");
    }

    await ctx.db.patch("users", args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });
    return null;
  },
});
