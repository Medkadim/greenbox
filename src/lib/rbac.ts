export const ROLES = [
  "CUSTOMER",
  "KITCHEN_CHEF",
  "DELIVERY_DRIVER",
  "ADMIN",
] as const;

export type Role = (typeof ROLES)[number];

// Route prefix each role lands on after login, and is restricted to.
// ADMIN can additionally reach every other section for oversight.
export const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard",
  KITCHEN_CHEF: "/kitchen",
  DELIVERY_DRIVER: "/delivery",
  ADMIN: "/admin",
};

export const ROLE_SECTION_PREFIX: Record<Role, string> = {
  CUSTOMER: "/dashboard",
  KITCHEN_CHEF: "/kitchen",
  DELIVERY_DRIVER: "/delivery",
  ADMIN: "/admin",
};

export function canAccessSection(role: Role, pathname: string): boolean {
  if (role === "ADMIN") return true;
  return pathname.startsWith(ROLE_SECTION_PREFIX[role]);
}
