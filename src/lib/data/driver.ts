import { db } from "@/lib/db";

export function listDrivers() {
  return db.driver.findMany({
    include: { user: { select: { name: true, phoneNumber: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getDriverByUserId(userId: string) {
  return db.driver.findUnique({ where: { userId } });
}
