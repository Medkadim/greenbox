import { z } from "zod";

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(8, "Enter a valid phone number")
    .regex(/^\+?[0-9\s]{8,15}$/, "Use international format, e.g. +212600000000"),
});

export const otpSchema = z.object({
  phoneNumber: z.string(),
  code: z.string().length(6, "Enter the 6-digit code"),
});

export type PhoneInput = z.infer<typeof phoneSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
