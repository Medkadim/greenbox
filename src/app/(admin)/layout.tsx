import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/require-role";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRole("ADMIN");

  return (
    <AppShell role={role} userName={session.user.name}>
      {children}
    </AppShell>
  );
}
