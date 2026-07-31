import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/require-role";

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRole("KITCHEN_CHEF");

  return (
    <AppShell role={role} userName={session.user.name}>
      {children}
    </AppShell>
  );
}
