import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const password = Password<DataModel>({
  profile(params) {
    if (typeof params.email !== "string" || params.email.trim().length === 0) {
      throw new Error("Email is required");
    }
    const name = typeof params.name === "string" ? params.name.trim() : "";
    return {
      email: params.email.trim(),
      name: name.length > 0 ? name : undefined,
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      const dbCtx = ctx as MutationCtx;
      const user = await dbCtx.db.get("users", args.userId);
      if (!user) {
        throw new Error("User not found");
      }

      const now = Date.now();
      const identity = await dbCtx.auth.getUserIdentity();
      await dbCtx.db.patch("users", args.userId, {
        role: user.role ?? "user",
        createdAt: user.createdAt ?? now,
        updatedAt: now,
        tokenIdentifier: user.tokenIdentifier ?? identity?.tokenIdentifier,
      });
    },
  },
});
