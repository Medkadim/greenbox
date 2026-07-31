"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import { notifyActiveSubscribers } from "@/lib/notifications";
import {
  weeklyMenuSchema,
  setMenuItemSchema,
  type WeeklyMenuInput,
  type SetMenuItemInput,
} from "@/lib/validations/weekly-menu";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function createWeeklyMenu(input: WeeklyMenuInput) {
  await requireAdmin();
  const data = weeklyMenuSchema.parse(input);

  const weekStartDate = new Date(data.weekStartDate);
  const weekEndDate = new Date(weekStartDate.getTime() + 6 * DAY_MS);
  const selectionDeadline = new Date(data.selectionDeadline);

  const menu = await db.weeklyMenu.create({
    data: { weekStartDate, weekEndDate, selectionDeadline, status: "DRAFT" },
  });

  revalidatePath("/admin/menus");

  return menu.id;
}

export async function setMenuItem(input: SetMenuItemInput) {
  await requireAdmin();
  const data = setMenuItemSchema.parse(input);

  await db.$transaction([
    db.menuItem.deleteMany({
      where: {
        weeklyMenuId: data.weeklyMenuId,
        dayOfWeek: data.dayOfWeek,
        mealSlot: data.mealSlot,
      },
    }),
    db.menuItem.create({
      data: {
        weeklyMenuId: data.weeklyMenuId,
        dayOfWeek: data.dayOfWeek,
        mealSlot: data.mealSlot,
        mealId: data.mealId,
      },
    }),
  ]);

  revalidatePath(`/admin/menus/${data.weeklyMenuId}`);
}

export async function removeMenuItem(menuItemId: string, weeklyMenuId: string) {
  await requireAdmin();

  await db.menuItem.delete({ where: { id: menuItemId } });

  revalidatePath(`/admin/menus/${weeklyMenuId}`);
}

export async function publishWeeklyMenu(weeklyMenuId: string) {
  await requireAdmin();

  const menu = await db.weeklyMenu.update({
    where: { id: weeklyMenuId },
    data: { status: "PUBLISHED" },
  });

  await notifyActiveSubscribers({
    type: "MENU_AVAILABLE",
    title: "This week's menu is up",
    body: `Choose your meals for ${menu.weekStartDate.toLocaleDateString()} – ${menu.weekEndDate.toLocaleDateString()} before the deadline.`,
  });

  revalidatePath(`/admin/menus/${weeklyMenuId}`);
  revalidatePath("/admin/menus");
  revalidatePath("/dashboard/menu");
}

export async function lockWeeklyMenu(weeklyMenuId: string) {
  await requireAdmin();

  await db.weeklyMenu.update({
    where: { id: weeklyMenuId },
    data: { status: "LOCKED" },
  });

  revalidatePath(`/admin/menus/${weeklyMenuId}`);
  revalidatePath("/admin/menus");
  revalidatePath("/dashboard/menu");
}
