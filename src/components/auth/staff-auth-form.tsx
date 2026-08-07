"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import {
  staffSignInSchema,
  staffSignUpSchema,
  type StaffSignInInput,
  type StaffSignUpInput,
} from "@/lib/validations/auth";
import { ROLE_HOME, type Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StaffAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signInForm = useForm<StaffSignInInput>({
    resolver: zodResolver(staffSignInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<StaffSignUpInput>({
    resolver: zodResolver(staffSignUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  function redirectByRole(role: Role | undefined) {
    router.push(ROLE_HOME[role ?? "PENDING"]);
    router.refresh();
  }

  async function onSignIn(values: StaffSignInInput) {
    setLoading(true);
    const { data, error } = await authClient.signIn.email(values);
    setLoading(false);

    if (error) {
      toast.error("Invalid email or password.");
      return;
    }
    redirectByRole((data?.user as { role?: Role } | undefined)?.role);
  }

  async function onSignUp(values: StaffSignUpInput) {
    setLoading(true);
    const { data, error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.status === 422
          ? "An account with this email already exists."
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@greenbox.ma"
            {...signInForm.register("email")}
          />
          {signInForm.formState.errors.email && (
            <p className="text-destructive text-sm">
              {signInForm.formState.errors.email.message}
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
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...signUpForm.register("name")} />
        {signUpForm.formState.errors.name && (
          <p className="text-destructive text-sm">
            {signUpForm.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@greenbox.ma"
          {...signUpForm.register("email")}
        />
        {signUpForm.formState.errors.email && (
          <p className="text-destructive text-sm">
            {signUpForm.formState.errors.email.message}
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
      <p className="text-muted-foreground text-center text-xs">
        New staff accounts have no access yet. An admin promotes you to your
        team role.
      </p>
    </form>
  );
}
