"use server";

import { revalidatePath } from "next/cache";

import { APIError } from "better-auth";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireCustomerId, requireAdmin } from "@/lib/auth-guards";
import { phoneToLocalEmail } from "@/lib/phone-identity";
import {
  adminCreateCustomerSchema,
  customerProfileSchema,
  customerPreferenceSchema,
  customerAllergiesSchema,
  type AdminCreateCustomerInput,
  type CustomerProfileInput,
  type CustomerPreferenceInput,
  type CustomerAllergiesInput,
} from "@/lib/validations/customer";
import type { CustomerTagType } from "@/generated/prisma/client";

export async function adminCreateCustomer(
  input: AdminCreateCustomerInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const data = adminCreateCustomerSchema.parse(input);

  let userId: string;
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: data.phoneNumber,
        email: phoneToLocalEmail(data.phoneNumber),
        password: data.password,
        phoneNumber: data.phoneNumber,
      },
    });
    userId = result.user.id;
  } catch (error) {
    if (error instanceof APIError && error.status === "UNPROCESSABLE_ENTITY") {
      return { error: "A customer with this phone number is already registered." };
    }
    return { error: "Could not create the customer account." };
  }

  const profile = await db.customerProfile.create({
    data: { userId, firstName: data.firstName, lastName: data.lastName },
  });
  await db.customerProfileTag.create({
    data: { customerProfileId: profile.id, tag: "NEW_CUSTOMER" },
  });

  revalidatePath("/admin/customers");
}

function toCoordinate(value: string | number | null | undefined, min: number, max: number) {
  if (value === "" || value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num) || num < min || num > max) return null;
  return num;
}

export async function upsertCustomerProfile(input: CustomerProfileInput) {
  const userId = await requireCustomerId();
  const data = customerProfileSchema.parse(input);
  const latitude = toCoordinate(data.latitude, -90, 90);
  const longitude = toCoordinate(data.longitude, -180, 180);

  const existing = await db.customerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const profile = await db.customerProfile.upsert({
    where: { userId },
    create: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address || null,
      latitude,
      longitude,
      preferredDeliveryStart: data.preferredDeliveryStart || null,
      preferredDeliveryEnd: data.preferredDeliveryEnd || null,
      suggestions: data.suggestions || null,
    },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address || null,
      latitude,
      longitude,
      preferredDeliveryStart: data.preferredDeliveryStart || null,
      preferredDeliveryEnd: data.preferredDeliveryEnd || null,
      suggestions: data.suggestions || null,
    },
  });

  if (!existing) {
    await db.customerProfileTag.upsert({
      where: {
        customerProfileId_tag: {
          customerProfileId: profile.id,
          tag: "NEW_CUSTOMER",
        },
      },
      create: { customerProfileId: profile.id, tag: "NEW_CUSTOMER" },
      update: {},
    });
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
}

export async function addCustomerPreference(input: CustomerPreferenceInput) {
  const userId = await requireCustomerId();
  const data = customerPreferenceSchema.parse(input);

  const profile = await db.customerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  await db.customerPreference.create({
    data: { customerProfileId: profile.id, type: data.type, label: data.label },
  });

  revalidatePath("/dashboard/profile");
}

export async function deleteCustomerPreference(preferenceId: string) {
  const userId = await requireCustomerId();

  await db.customerPreference.deleteMany({
    where: { id: preferenceId, customerProfile: { userId } },
  });

  revalidatePath("/dashboard/profile");
}

export async function updateCustomerAllergies(input: CustomerAllergiesInput) {
  const userId = await requireCustomerId();
  const data = customerAllergiesSchema.parse(input);

  const profile = await db.customerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  await db.$transaction([
    ...data.allergies.map(({ allergyId, checked, notes }) =>
      checked
        ? db.customerAllergy.upsert({
            where: {
              customerProfileId_allergyId: {
                customerProfileId: profile.id,
                allergyId,
              },
            },
            create: { customerProfileId: profile.id, allergyId, notes: notes || null },
            update: { notes: notes || null },
          })
        : db.customerAllergy.deleteMany({
            where: { customerProfileId: profile.id, allergyId },
          })
    ),
    db.customerProfile.update({
      where: { id: profile.id },
      data: { otherAllergies: data.otherAllergies || null },
    }),
  ]);

  revalidatePath("/dashboard/profile");
}

export async function toggleCustomerTag(
  customerProfileId: string,
  tag: CustomerTagType,
  enabled: boolean
) {
  await requireAdmin();

  if (enabled) {
    await db.customerProfileTag.upsert({
      where: { customerProfileId_tag: { customerProfileId, tag } },
      create: { customerProfileId, tag },
      update: {},
    });
  } else {
    await db.customerProfileTag.deleteMany({
      where: { customerProfileId, tag },
    });
  }

  revalidatePath(`/admin/customers/${customerProfileId}`);
  revalidatePath("/admin/customers");
}
