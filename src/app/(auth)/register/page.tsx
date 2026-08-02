import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerAuthForm } from "@/components/auth/customer-auth-form";
import { StaffAuthForm } from "@/components/auth/staff-auth-form";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start your GreenBox subscription.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="customer">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="staff">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <CustomerAuthForm mode="register" />
          </TabsContent>
          <TabsContent value="staff">
            <StaffAuthForm mode="register" />
          </TabsContent>
        </Tabs>
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
