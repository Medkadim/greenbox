import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerAuthForm } from "@/components/auth/customer-auth-form";
import { StaffAuthForm } from "@/components/auth/staff-auth-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to manage your meals.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customer">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="staff">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <CustomerAuthForm mode="login" />
          </TabsContent>
          <TabsContent value="staff">
            <StaffAuthForm mode="login" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
