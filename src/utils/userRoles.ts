import type { UserResponse } from "../types/user";

export function isAdmin(user: UserResponse): boolean {
  return user.role === "Admin";
}

export function isCaseManager(user: UserResponse): boolean {
  return user.role === "Case Manager" || user.role === "IPCM";
}

export function getRoleDisplayName(user: UserResponse): string {
  return isCaseManager(user) ? "Case Manager" : user.role;
}
