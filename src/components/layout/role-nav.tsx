"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function RoleNav({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  if (items.length < 2) return null;

  return (
    <nav className="bg-background border-b">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
        {items.map((item) => {
          const isActive =
            item.href === pathname ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
