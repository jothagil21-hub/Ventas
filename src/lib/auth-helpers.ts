import { auth } from "@/auth";
import type { AppRole } from "@/auth.config";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function isAdmin(role: AppRole | undefined) {
  return role === "ADMIN";
}
