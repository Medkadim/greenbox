import { z } from "zod";

export const deliveryStatusEnum = z.enum([
  "PENDING",
  "PREPARING",
  "READY",
  "ON_THE_WAY",
  "DELIVERED",
  "FAILED",
]);

export const updateDeliveryStatusSchema = z.object({
  deliveryId: z.string().min(1),
  status: deliveryStatusEnum,
});

export type UpdateDeliveryStatusInput = z.infer<typeof updateDeliveryStatusSchema>;
