import type { WeeklyMenu } from "@/generated/prisma/client";

export function getMenuEditError(
  menu: Pick<WeeklyMenu, "status" | "selectionDeadline">
): string | null {
  if (menu.status === "LOCKED") {
    return "This week's menu is locked and can no longer be changed.";
  }
  if (new Date() > menu.selectionDeadline) {
    return "The selection deadline for this week has passed.";
  }
  return null;
}
