import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import type { Role } from "@/lib/rbac";

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export function getUserRole(user: { role?: string | null }): Role {
  return (user.role as Role | undefined) ?? "PENDING";
}
