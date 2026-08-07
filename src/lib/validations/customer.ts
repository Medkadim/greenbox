import { z } from "zod";

import { phoneNumberSchema } from "@/lib/validations/auth";

function toCoordinateSchema(min: number, max: number) {
  return z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .refine(
      (value) => {
        if (value === "" || value === null || value === undefined) return true;
        const num = typeof value === "number" ? value : Number(value);
        return !Number.isNaN(num) && num >= min && num <= max;
      },
      { message: `Must be between ${min} and ${max}` }
    );
}

export const customerProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  phoneNumber: phoneNumberSchema,
  address: z.string().max(300).optional().or(z.literal("")),
  latitude: toCoordinateSchema(-90, 90),
  longitude: toCoordinateSchema(-180, 180),
  preferredDeliveryStart: z.string().max(5).optional().or(z.literal("")),
  preferredDeliveryEnd: z.string().max(5).optional().or(z.literal("")),
  suggestions: z.string().max(1000).optional().or(z.literal("")),
  otherAllergies: z.string().max(300).optional().or(z.literal("")),
});

export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;

export const customerStatusEnum = z.enum(["ACTIVE", "PAUSED", "INACTIVE"]);
export type CustomerStatusInput = z.infer<typeof customerStatusEnum>;

export const preferenceTypeEnum = z.enum(["LIKE", "DISLIKE", "AVOID"]);

export const customerPreferenceSchema = z.object({
  type: preferenceTypeEnum,
  label: z.string().min(1, "Describe the preference").max(120),
});

export type CustomerPreferenceInput = z.infer<typeof customerPreferenceSchema>;

export const customerAllergiesSchema = z.object({
  allergies: z.array(
    z.object({
      allergyId: z.string(),
      checked: z.boolean(),
      notes: z.string().max(200).optional().or(z.literal("")),
    })
  ),
  otherAllergies: z.string().max(300).optional().or(z.literal("")),
});

export type CustomerAllergiesInput = z.infer<typeof customerAllergiesSchema>;
