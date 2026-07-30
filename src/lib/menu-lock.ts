import type { WeeklyMenu } from "@/generated/prisma/client";

export function assertMenuEditable(menu: Pick<WeeklyMenu, "status" | "selectionDeadline">) {
  if (menu.status === "LOCKED") {
    throw new Error("This week's menu is locked and can no longer be changed.");
  }
  if (new Date() > menu.selectionDeadline) {
    throw new Error("The selection deadline for this week has passed.");
  }
}
