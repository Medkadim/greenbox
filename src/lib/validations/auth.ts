import { z } from "zod";

export const phoneNumberSchema = z
  .string()
  .min(8, "Enter a valid phone number")
  .regex(/^\+?[0-9\s]{8,15}$/, "Use international format, e.g. +212600000000");

export const passwordSchema = z.string().min(8, "Use at least 8 characters");

export const driverSignInSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: z.string().min(1, "Enter your password"),
});

export const staffSignInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const staffSignUpSchema = z
  .object({
    name: z.string().min(1, "Enter your name"),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type DriverSignInInput = z.infer<typeof driverSignInSchema>;
export type StaffSignInInput = z.infer<typeof staffSignInSchema>;
export type StaffSignUpInput = z.infer<typeof staffSignUpSchema>;
