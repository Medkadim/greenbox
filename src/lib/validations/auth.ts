import { z } from "zod";

const phoneNumber = z
  .string()
  .min(8, "Enter a valid phone number")
  .regex(/^\+?[0-9\s]{8,15}$/, "Use international format, e.g. +212600000000");

const password = z.string().min(8, "Use at least 8 characters");

export const customerSignInSchema = z.object({
  phoneNumber,
  password: z.string().min(1, "Enter your password"),
});

export const customerSignUpSchema = z
  .object({
    phoneNumber,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const staffSignInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const staffSignUpSchema = z
  .object({
    name: z.string().min(1, "Enter your name"),
    email: z.string().email("Enter a valid email address"),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CustomerSignInInput = z.infer<typeof customerSignInSchema>;
export type CustomerSignUpInput = z.infer<typeof customerSignUpSchema>;
export type StaffSignInInput = z.infer<typeof staffSignInSchema>;
export type StaffSignUpInput = z.infer<typeof staffSignUpSchema>;
