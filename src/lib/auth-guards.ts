import { getServerSession, getUserRole } from "@/lib/session";

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session) throw new Error("Not authenticated");
  if (getUserRole(session.user) !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return session;
}

export async function requireDeliveryStaff() {
  const session = await getServerSession();
  if (!session) throw new Error("Not authenticated");
  const role = getUserRole(session.user);
  if (role !== "ADMIN" && role !== "DELIVERY_DRIVER") {
    throw new Error("Delivery team access required");
  }
  return session;
}
