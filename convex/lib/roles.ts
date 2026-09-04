export const USER_ROLES = ["user", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function resolveRole(role: UserRole | undefined): UserRole {
  return role ?? "user";
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return resolveRole(role) === "admin";
}
