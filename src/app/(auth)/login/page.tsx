import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DriverAuthForm } from "@/components/auth/driver-auth-form";
import { StaffAuthForm } from "@/components/auth/staff-auth-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to GreenBox.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="staff">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="staff">Team</TabsTrigger>
            <TabsTrigger value="driver">Driver</TabsTrigger>
          </TabsList>
          <TabsContent value="staff">
            <StaffAuthForm mode="login" />
          </TabsContent>
          <TabsContent value="driver">
            <DriverAuthForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
