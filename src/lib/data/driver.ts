import { db } from "@/lib/db";

export function listDrivers() {
  return db.driver.findMany({
    include: { user: { select: { name: true, phoneNumber: true } } },
    orderBy: { createdAt: "desc" },
  });
}
