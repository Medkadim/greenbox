import { z } from "zod";

export const createDriverSchema = z.object({
  phoneNumber: z.string().min(8, "Enter a valid phone number"),
  vehicleInfo: z.string().max(100).optional().or(z.literal("")),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
