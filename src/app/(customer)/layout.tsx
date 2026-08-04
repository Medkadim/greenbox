import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/require-role";
import { getCustomerProfileByUserId } from "@/lib/data/customer";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRole("CUSTOMER");

  const profile =
    role === "CUSTOMER" ? await getCustomerProfileByUserId(session.user.id) : null;
  const badgeLabel = profile ? `${profile.firstName} ${profile.lastName}` : undefined;

  return (
    <AppShell role={role} userName={session.user.phoneNumber} badgeLabel={badgeLabel}>
      {children}
    </AppShell>
  );
}
