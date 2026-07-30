import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/require-role";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await requireRole("ADMIN");

  return (
    <AppShell role="ADMIN" userName={session.user.name}>
      {children}
    </AppShell>
  );
}
