import { redirect } from "next/navigation";

import { getServerSession, getUserRole } from "@/lib/session";
import { ROLE_HOME, type Role } from "@/lib/rbac";

export async function requireRole(allowed: Role) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const role = getUserRole(session.user);
  if (role !== allowed && role !== "ADMIN") {
    redirect(ROLE_HOME[role]);
  }

  return { session, role };
}
