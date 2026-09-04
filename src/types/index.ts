import type { Id } from "../../convex/_generated/dataModel";

export type UserRole = "user" | "admin";

export interface User {
  _id: Id<"users">;
  name?: string;
  email?: string;
  image?: string;
  role: UserRole;
  createdAt?: number;
  updatedAt?: number;
}

export interface Note {
  _id: Id<"notes">;
  userId: Id<"users">;
  title: string;
  body: string;
  createdAt: number;
  updatedAt?: number;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  flow: "signIn" | "signUp";
}
