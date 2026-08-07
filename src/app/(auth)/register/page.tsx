import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffAuthForm } from "@/components/auth/staff-auth-form";

// Only the GreenBox team self-registers here (an admin then promotes the
// account to KITCHEN_CHEF/ADMIN). Customers and drivers have no self-service
// signup — the admin creates those accounts directly.
export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a team account</CardTitle>
        <CardDescription>For GreenBox staff only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <StaffAuthForm mode="register" />
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
