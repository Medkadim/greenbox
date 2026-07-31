import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/require-role";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRole("DELIVERY_DRIVER");

  return (
    <AppShell role={role} userName={session.user.name}>
      {children}
    </AppShell>
  );
}
