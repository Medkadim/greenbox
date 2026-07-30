import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/require-role";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await requireRole("DELIVERY_DRIVER");

  return (
    <AppShell role="DELIVERY_DRIVER" userName={session.user.name}>
      {children}
    </AppShell>
  );
}
