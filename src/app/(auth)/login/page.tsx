import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in with your phone number to manage your meals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PhoneOtpForm mode="login" />
      </CardContent>
    </Card>
  );
}
