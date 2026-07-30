import type { Role } from "@/lib/rbac";

export const NAV_ITEMS: Record<Role, { label: string; href: string }[]> = {
  CUSTOMER: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Subscription", href: "/dashboard/subscription" },
    { label: "Profile", href: "/dashboard/profile" },
  ],
  KITCHEN_CHEF: [{ label: "Production", href: "/kitchen" }],
  DELIVERY_DRIVER: [{ label: "Deliveries", href: "/delivery" }],
  ADMIN: [
    { label: "Overview", href: "/admin" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Meals", href: "/admin/meals" },
    { label: "Plans", href: "/admin/plans" },
    { label: "Subscriptions", href: "/admin/subscriptions" },
  ],
};
