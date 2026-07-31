import { z } from "zod";

export const submitRatingSchema = z.object({
  customerMealSelectionId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type SubmitRatingInput = z.infer<typeof submitRatingSchema>;
