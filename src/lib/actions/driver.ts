"use server";

import { revalidatePath } from "next/cache";

import { APIError } from "better-auth";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { phoneToLocalEmail } from "@/lib/phone-identity";
import { parseInput } from "@/lib/parse-input";
import {
  adminCreateDriverSchema,
  type AdminCreateDriverInput,
} from "@/lib/validations/driver";

export async function adminCreateDriver(
  input: AdminCreateDriverInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(adminCreateDriverSchema, input);
  if (!parsed.success) return { error: parsed.error };
  const data = parsed.data;

  let userId: string;
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: phoneToLocalEmail(data.phoneNumber),
        password: data.password,
        phoneNumber: data.phoneNumber,
      },
    });
    userId = result.user.id;
  } catch (error) {
    if (error instanceof APIError && error.status === "UNPROCESSABLE_ENTITY") {
      return { error: "A driver with this phone number is already registered." };
    }
    return { error: "Could not create the driver account." };
  }

  await db.user.update({ where: { id: userId }, data: { role: "DELIVERY_DRIVER" } });
  await db.driver.create({
    data: { userId, vehicleInfo: data.vehicleInfo || null, isActive: true },
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
