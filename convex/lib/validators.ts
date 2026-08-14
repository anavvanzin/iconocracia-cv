import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { resolveRole, type UserRole } from "./roles";

export const roleValidator = v.union(v.literal("user"), v.literal("admin"));

export const publicUserValidator = v.object({
  _id: v.id("users"),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  image: v.optional(v.string()),
  role: roleValidator,
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

export const noteValidator = v.object({
  _id: v.id("notes"),
  userId: v.id("users"),
  title: v.string(),
  body: v.string(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
});

export function toPublicUser(user: Doc<"users">): {
  _id: Doc<"users">["_id"];
  name: string | undefined;
  email: string | undefined;
  image: string | undefined;
  role: UserRole;
  createdAt: number | undefined;
  updatedAt: number | undefined;
} {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: resolveRole(user.role),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
