"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerId } from "@/lib/auth-guards";
import { getMenuEditError } from "@/lib/menu-lock";
import {
  selectMealSchema,
  mealRequestSchema,
  type SelectMealInput,
  type MealRequestInput,
} from "@/lib/validations/menu-selection";

type ActionResult = { error: string } | void;

async function requireProfileId(userId: string): Promise<{ id: string } | { error: string }> {
  const profile = await db.customerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    return { error: "Please complete your profile before choosing meals." };
  }
  return { id: profile.id };
}

export async function selectMeal(input: SelectMealInput): Promise<ActionResult> {
  const userId = await requireCustomerId();
  const data = selectMealSchema.parse(input);
  const profileResult = await requireProfileId(userId);
  if ("error" in profileResult) return profileResult;
  const customerProfileId = profileResult.id;

  const weeklyMenu = await db.weeklyMenu.findUniqueOrThrow({
    where: { id: data.weeklyMenuId },
  });
  const menuError = getMenuEditError(weeklyMenu);
  if (menuError) return { error: menuError };

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

export async function addMealRequest(input: MealRequestInput): Promise<ActionResult> {
  const userId = await requireCustomerId();
  const data = mealRequestSchema.parse(input);

  const selection = await db.customerMealSelection.findFirstOrThrow({
    where: {
      id: data.customerMealSelectionId,
      customerProfile: { userId },
    },
    include: { weeklyMenu: true },
  });
  const menuError = getMenuEditError(selection.weeklyMenu);
  if (menuError) return { error: menuError };

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

export async function confirmWeekSelections(weeklyMenuId: string): Promise<ActionResult> {
  const userId = await requireCustomerId();
  const profileResult = await requireProfileId(userId);
  if ("error" in profileResult) return profileResult;
  const customerProfileId = profileResult.id;

  const weeklyMenu = await db.weeklyMenu.findUniqueOrThrow({
    where: { id: weeklyMenuId },
  });
  const menuError = getMenuEditError(weeklyMenu);
  if (menuError) return { error: menuError };

  await db.customerMealSelection.updateMany({
    where: { customerProfileId, weeklyMenuId },
    data: { confirmedAt: new Date() },
  });

  revalidatePath("/dashboard/menu");
}
