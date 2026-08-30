import type { Role } from "@/lib/rbac";

export const NAV_ITEMS: Record<Role, { label: string; href: string }[]> = {
  PENDING: [],
  KITCHEN_CHEF: [
    { label: "Production", href: "/kitchen" },
    { label: "Ingredients", href: "/kitchen/ingredients" },
  ],
  DELIVERY_DRIVER: [{ label: "Deliveries", href: "/delivery" }],
  ADMIN: [
    { label: "Overview", href: "/admin" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Meals", href: "/admin/meals" },
    { label: "Schedule", href: "/admin/schedule" },
    { label: "Ingredients", href: "/admin/ingredients" },
    { label: "Kitchen", href: "/admin/kitchen" },
    { label: "Deliveries", href: "/delivery" },
    { label: "Drivers", href: "/admin/drivers" },
  ],
};
