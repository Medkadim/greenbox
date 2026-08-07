import Link from "next/link";
import { Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { RoleNav } from "@/components/layout/role-nav";
import { NAV_ITEMS } from "@/lib/nav-config";
import type { Role } from "@/lib/rbac";

const ROLE_LABEL: Record<Role, string> = {
  PENDING: "Pending",
  KITCHEN_CHEF: "Kitchen",
  DELIVERY_DRIVER: "Delivery",
  ADMIN: "Admin",
};

export function AppShell({
  role,
  userName,
  badgeLabel,
  children,
}: {
  role: Role;
  userName?: string | null;
  badgeLabel?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Leaf className="text-primary size-5" />
            GreenBox
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{badgeLabel || ROLE_LABEL[role]}</Badge>
            {userName && (
              <span className="text-muted-foreground hidden text-sm sm:inline">
                {userName}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>
      <RoleNav items={NAV_ITEMS[role]} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
