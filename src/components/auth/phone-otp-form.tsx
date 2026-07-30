"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { phoneSchema, otpSchema, type PhoneInput, type OtpInput } from "@/lib/validations/auth";
import { ROLE_HOME, type Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PhoneOtpForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const phoneForm = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const otpForm = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { phoneNumber: "", code: "" },
  });

  async function onSendOtp(values: PhoneInput) {
    setLoading(true);
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: values.phoneNumber,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Could not send the verification code.");
      return;
    }

    setPhoneNumber(values.phoneNumber);
    otpForm.setValue("phoneNumber", values.phoneNumber);
    toast.success("Verification code sent.");
  }

  async function onVerifyOtp(values: OtpInput) {
    setLoading(true);
    const { data, error } = await authClient.phoneNumber.verify({
      phoneNumber: values.phoneNumber,
      code: values.code,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Invalid or expired code.");
      return;
    }

    const role = (data?.user as { role?: Role } | undefined)?.role ?? "CUSTOMER";
    router.push(ROLE_HOME[role]);
    router.refresh();
  }

  if (!phoneNumber) {
    return (
      <form
        onSubmit={phoneForm.handleSubmit(onSendOtp)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <Input
            id="phoneNumber"
            placeholder="+212 6XX XXX XXX"
            {...phoneForm.register("phoneNumber")}
          />
          {phoneForm.formState.errors.phoneNumber && (
            <p className="text-destructive text-sm">
              {phoneForm.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {mode === "login" ? "Send code" : "Create account"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Verification code</Label>
        <Input
          id="code"
          inputMode="numeric"
          placeholder="123456"
          {...otpForm.register("code")}
        />
        {otpForm.formState.errors.code && (
          <p className="text-destructive text-sm">
            {otpForm.formState.errors.code.message}
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          Sent to {phoneNumber}.
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        Verify &amp; continue
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setPhoneNumber(null)}
      >
        Use a different number
      </Button>
    </form>
  );
}
