import type { Role } from "@/lib/rbac";

export const NAV_ITEMS: Record<Role, { label: string; href: string }[]> = {
  CUSTOMER: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Weekly menu", href: "/dashboard/menu" },
    { label: "Subscription", href: "/dashboard/subscription" },
    { label: "Profile", href: "/dashboard/profile" },
  ],
  KITCHEN_CHEF: [
    { label: "Production", href: "/kitchen" },
    { label: "Ingredients", href: "/kitchen/ingredients" },
  ],
  DELIVERY_DRIVER: [{ label: "Deliveries", href: "/delivery" }],
  ADMIN: [
    { label: "Overview", href: "/admin" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Meals", href: "/admin/meals" },
    { label: "Menus", href: "/admin/menus" },
    { label: "Kitchen", href: "/admin/kitchen" },
    { label: "Deliveries", href: "/delivery" },
    { label: "Drivers", href: "/admin/drivers" },
    { label: "Plans", href: "/admin/plans" },
    { label: "Subscriptions", href: "/admin/subscriptions" },
    { label: "Finance", href: "/admin/finance" },
  ],
};
