import { z } from "zod";

import { phoneNumberSchema, passwordSchema } from "@/lib/validations/auth";

export const adminCreateDriverSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  phoneNumber: phoneNumberSchema,
  password: passwordSchema,
  vehicleInfo: z.string().max(100).optional().or(z.literal("")),
});

export type AdminCreateDriverInput = z.infer<typeof adminCreateDriverSchema>;
