import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/require-role";

const KITCHEN_NAV_AR = [
  { label: "الإنتاج", href: "/kitchen" },
  { label: "المكونات", href: "/kitchen/ingredients" },
];

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRole("KITCHEN_CHEF");

  return (
    <AppShell
      role={role}
      userName={session.user.name}
      badgeLabel="المطبخ"
      dir="rtl"
      navItems={KITCHEN_NAV_AR}
      signOutLabel="تسجيل الخروج"
    >
      {children}
    </AppShell>
  );
}
