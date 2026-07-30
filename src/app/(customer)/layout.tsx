import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/require-role";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await requireRole("CUSTOMER");

  return (
    <AppShell role="CUSTOMER" userName={session.user.name}>
      {children}
    </AppShell>
  );
}
