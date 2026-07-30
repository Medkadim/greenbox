import { db } from "@/lib/db";

export function getCustomerProfileByUserId(userId: string) {
  return db.customerProfile.findUnique({
    where: { userId },
    include: {
      preferences: { orderBy: { createdAt: "asc" } },
      allergies: { include: { allergy: true } },
      tags: true,
    },
  });
}

export function listAllergies() {
  return db.allergy.findMany({ orderBy: { name: "asc" } });
}

export function listCustomerProfiles() {
  return db.customerProfile.findMany({
    include: {
      user: { select: { name: true, phoneNumber: true, email: true } },
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getCustomerProfileById(id: string) {
  return db.customerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, phoneNumber: true, email: true, createdAt: true } },
      preferences: { orderBy: { createdAt: "asc" } },
      allergies: { include: { allergy: true } },
      tags: true,
    },
  });
}
