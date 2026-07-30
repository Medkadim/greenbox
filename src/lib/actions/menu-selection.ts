"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerId } from "@/lib/auth-guards";
import { assertMenuEditable } from "@/lib/menu-lock";
import {
  selectMealSchema,
  mealRequestSchema,
  type SelectMealInput,
  type MealRequestInput,
} from "@/lib/validations/menu-selection";

async function requireProfileId(userId: string) {
  const profile = await db.customerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    throw new Error("Please complete your profile before choosing meals.");
  }
  return profile.id;
}

export async function selectMeal(input: SelectMealInput) {
  const userId = await requireCustomerId();
  const data = selectMealSchema.parse(input);
  const customerProfileId = await requireProfileId(userId);

  const weeklyMenu = await db.weeklyMenu.findUniqueOrThrow({
    where: { id: data.weeklyMenuId },
  });
  assertMenuEditable(weeklyMenu);

  const menuItem = await db.menuItem.upsert({
    where: {
      weeklyMenuId_dayOfWeek_mealSlot_mealId: {
        weeklyMenuId: data.weeklyMenuId,
        dayOfWeek: data.dayOfWeek,
        mealSlot: data.mealSlot,
        mealId: data.mealId,
      },
    },
    create: {
      weeklyMenuId: data.weeklyMenuId,
      dayOfWeek: data.dayOfWeek,
      mealSlot: data.mealSlot,
      mealId: data.mealId,
      isRecommended: false,
    },
    update: {},
  });

  await db.$transaction([
    db.customerMealSelection.deleteMany({
      where: {
        customerProfileId,
        weeklyMenuId: data.weeklyMenuId,
        menuItem: { dayOfWeek: data.dayOfWeek, mealSlot: data.mealSlot },
      },
    }),
    db.customerMealSelection.create({
      data: {
        customerProfileId,
        weeklyMenuId: data.weeklyMenuId,
        menuItemId: menuItem.id,
        source: menuItem.isRecommended ? "RECOMMENDED" : "CUSTOM",
      },
    }),
  ]);

  revalidatePath("/dashboard/menu");
}

export async function addMealRequest(input: MealRequestInput) {
  const userId = await requireCustomerId();
  const data = mealRequestSchema.parse(input);

  const selection = await db.customerMealSelection.findFirstOrThrow({
    where: {
      id: data.customerMealSelectionId,
      customerProfile: { userId },
    },
    include: { weeklyMenu: true },
  });
  assertMenuEditable(selection.weeklyMenu);

  await db.mealCustomizationRequest.create({
    data: { customerMealSelectionId: selection.id, note: data.note },
  });

  revalidatePath("/dashboard/menu");
}

export async function deleteMealRequest(requestId: string) {
  const userId = await requireCustomerId();

  await db.mealCustomizationRequest.deleteMany({
    where: {
      id: requestId,
      customerMealSelection: { customerProfile: { userId } },
    },
  });

  revalidatePath("/dashboard/menu");
}

export async function confirmWeekSelections(weeklyMenuId: string) {
  const userId = await requireCustomerId();
  const customerProfileId = await requireProfileId(userId);

  const weeklyMenu = await db.weeklyMenu.findUniqueOrThrow({
    where: { id: weeklyMenuId },
  });
  assertMenuEditable(weeklyMenu);

  await db.customerMealSelection.updateMany({
    where: { customerProfileId, weeklyMenuId },
    data: { confirmedAt: new Date() },
  });

  revalidatePath("/dashboard/menu");
}
