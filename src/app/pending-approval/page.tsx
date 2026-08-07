import { Leaf } from "lucide-react";

import { requireRole } from "@/lib/require-role";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/layout/sign-out-button";

export default async function PendingApprovalPage() {
  await requireRole("PENDING");

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Leaf className="text-primary size-6" />
        GreenBox
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Account pending</CardTitle>
          <CardDescription>
            Your account has been created but has no role yet. Ask an admin to
            assign you as Kitchen or Admin to get access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
