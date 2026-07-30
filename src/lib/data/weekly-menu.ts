import { db } from "@/lib/db";

export function listWeeklyMenus() {
  return db.weeklyMenu.findMany({
    include: { menuItems: true },
    orderBy: { weekStartDate: "desc" },
  });
}

export function getWeeklyMenuById(id: string) {
  return db.weeklyMenu.findUnique({
    where: { id },
    include: { menuItems: { include: { meal: true } } },
  });
}

// The menu customers currently see: published/locked, covering or closest to today.
export function getCurrentPublishedMenu() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db.weeklyMenu.findFirst({
    where: {
      status: { in: ["PUBLISHED", "LOCKED"] },
      weekEndDate: { gte: today },
    },
    include: { menuItems: { include: { meal: true } } },
    orderBy: { weekStartDate: "asc" },
  });
}
