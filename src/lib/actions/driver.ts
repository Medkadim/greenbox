"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import {
  createDriverSchema,
  type CreateDriverInput,
} from "@/lib/validations/driver";

export async function createDriver(input: CreateDriverInput) {
  await requireAdmin();
  const data = createDriverSchema.parse(input);

  const user = await db.user.findUnique({
    where: { phoneNumber: data.phoneNumber },
  });
  if (!user) {
    throw new Error(
      "No account found for this phone number. Ask them to sign in first."
    );
  }
  if (user.role === "ADMIN") {
    throw new Error("Cannot make an admin a driver.");
  }

  await db.user.update({ where: { id: user.id }, data: { role: "DELIVERY_DRIVER" } });

  await db.driver.upsert({
    where: { userId: user.id },
    create: { userId: user.id, vehicleInfo: data.vehicleInfo || null, isActive: true },
    update: { vehicleInfo: data.vehicleInfo || null, isActive: true },
  });

  revalidatePath("/admin/drivers");
}

export async function toggleDriverActive(driverId: string, isActive: boolean) {
  await requireAdmin();

  await db.driver.update({ where: { id: driverId }, data: { isActive } });

  revalidatePath("/admin/drivers");
}

export async function assignDelivery(deliveryId: string, driverId: string | null) {
  await requireAdmin();

  await db.delivery.update({ where: { id: deliveryId }, data: { driverId } });

  revalidatePath("/delivery");
}
