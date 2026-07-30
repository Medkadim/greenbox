import { z } from "zod";

export const subscriptionPlanTypeEnum = z.enum([
  "WEEKLY",
  "MONTHLY",
  "LUNCH_ONLY",
  "LUNCH_AND_DINNER",
]);

export const subscriptionPlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: subscriptionPlanTypeEnum,
  mealsPerWeek: z.coerce.number().int().min(1).max(21),
  durationDays: z.coerce.number().int().min(1).max(366),
  price: z.coerce.number().min(0).max(1_000_000),
  isActive: z.boolean(),
});

export type SubscriptionPlanInput = z.infer<typeof subscriptionPlanSchema>;
