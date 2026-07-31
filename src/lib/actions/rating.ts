"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerId } from "@/lib/auth-guards";
import { getCustomerProfileByUserId } from "@/lib/data/customer";
import { submitRatingSchema, type SubmitRatingInput } from "@/lib/validations/rating";

export async function submitRating(input: SubmitRatingInput) {
  const userId = await requireCustomerId();
  const data = submitRatingSchema.parse(input);

  const profile = await getCustomerProfileByUserId(userId);
  if (!profile) throw new Error("Complete your profile first");

  const selection = await db.customerMealSelection.findUnique({
    where: { id: data.customerMealSelectionId },
    include: { menuItem: true, delivery: true },
  });
  if (!selection || selection.customerProfileId !== profile.id) {
    throw new Error("Meal selection not found");
  }
  if (!selection.delivery || selection.delivery.status !== "DELIVERED") {
    throw new Error("This meal hasn't been delivered yet");
  }

  await db.rating.create({
    data: {
      customerProfileId: profile.id,
      mealId: selection.menuItem.mealId,
      customerMealSelectionId: selection.id,
      score: data.score,
      comment: data.comment,
    },
  });

  revalidatePath("/dashboard/ratings");
  revalidatePath("/dashboard");
}
