import { db } from "@/lib/db";

export function listAllergies() {
  return db.allergy.findMany({ orderBy: { name: "asc" } });
}

export function listCustomerProfiles() {
  return db.customerProfile.findMany({
    include: { tags: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getCustomerProfileById(id: string) {
  return db.customerProfile.findUnique({
    where: { id },
    include: {
      preferences: { orderBy: { createdAt: "asc" } },
      allergies: { include: { allergy: true } },
      tags: true,
    },
  });
}
