"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { phoneToLocalEmail } from "@/lib/phone-identity";
import {
  customerSignInSchema,
  customerSignUpSchema,
  type CustomerSignInInput,
  type CustomerSignUpInput,
} from "@/lib/validations/auth";
import { ROLE_HOME, type Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signInForm = useForm<CustomerSignInInput>({
    resolver: zodResolver(customerSignInSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });

  const signUpForm = useForm<CustomerSignUpInput>({
    resolver: zodResolver(customerSignUpSchema),
    defaultValues: { phoneNumber: "", password: "", confirmPassword: "" },
  });

  function redirectByRole(role: Role | undefined) {
    router.push(ROLE_HOME[role ?? "CUSTOMER"]);
    router.refresh();
  }

  async function onSignIn(values: CustomerSignInInput) {
    setLoading(true);
    const { data, error } = await authClient.signIn.email({
      email: phoneToLocalEmail(values.phoneNumber),
      password: values.password,
    });
    setLoading(false);

    if (error) {
      toast.error("Invalid phone number or password.");
      return;
    }
    redirectByRole((data?.user as { role?: Role } | undefined)?.role);
  }

  async function onSignUp(values: CustomerSignUpInput) {
    setLoading(true);
    const { data, error } = await authClient.signUp.email({
      email: phoneToLocalEmail(values.phoneNumber),
      password: values.password,
      name: values.phoneNumber,
      // @ts-expect-error -- additionalFields (phoneNumber) aren't in the base signUp type
      phoneNumber: values.phoneNumber,
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.status === 422
          ? "This phone number is already registered."
          : (error.message ?? "Could not create your account.")
      );
      return;
    }
    redirectByRole((data?.user as { role?: Role } | undefined)?.role);
  }

  if (mode === "login") {
    return (
      <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <Input
            id="phoneNumber"
            placeholder="+212 6XX XXX XXX"
            {...signInForm.register("phoneNumber")}
          />
          {signInForm.formState.errors.phoneNumber && (
            <p className="text-destructive text-sm">
              {signInForm.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...signInForm.register("password")} />
          {signInForm.formState.errors.password && (
            <p className="text-destructive text-sm">
              {signInForm.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          Sign in
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone number</Label>
        <Input
          id="phoneNumber"
          placeholder="+212 6XX XXX XXX"
          {...signUpForm.register("phoneNumber")}
        />
        {signUpForm.formState.errors.phoneNumber && (
          <p className="text-destructive text-sm">
            {signUpForm.formState.errors.phoneNumber.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...signUpForm.register("password")} />
        {signUpForm.formState.errors.password && (
          <p className="text-destructive text-sm">
            {signUpForm.formState.errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...signUpForm.register("confirmPassword")}
        />
        {signUpForm.formState.errors.confirmPassword && (
          <p className="text-destructive text-sm">
            {signUpForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        Create account
      </Button>
    </form>
  );
}
