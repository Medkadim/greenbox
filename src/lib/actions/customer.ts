"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import { Prisma } from "@/generated/prisma/client";
import { parseInput } from "@/lib/parse-input";
import {
  customerProfileSchema,
  customerStatusEnum,
  customerPreferenceSchema,
  customerAllergiesSchema,
  type CustomerProfileInput,
  type CustomerStatusInput,
  type CustomerPreferenceInput,
  type CustomerAllergiesInput,
} from "@/lib/validations/customer";
import type { CustomerTagType } from "@/generated/prisma/client";

function toCoordinate(value: string | number | null | undefined) {
  if (value === "" || value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isNaN(num) ? null : num;
}

function profileData(data: CustomerProfileInput) {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    address: data.address || null,
    latitude: toCoordinate(data.latitude),
    longitude: toCoordinate(data.longitude),
    preferredDeliveryStart: data.preferredDeliveryStart || null,
    preferredDeliveryEnd: data.preferredDeliveryEnd || null,
    suggestions: data.suggestions || null,
    otherAllergies: data.otherAllergies || null,
  };
}

export async function adminCreateCustomer(
  input: CustomerProfileInput
): Promise<{ error: string } | { id: string }> {
  await requireAdmin();
  const parsed = parseInput(customerProfileSchema, input);
  if (!parsed.success) return { error: parsed.error };

  let profile;
  try {
    profile = await db.customerProfile.create({ data: profileData(parsed.data) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "A customer with this phone number already exists." };
    }
    throw error;
  }

  await db.customerProfileTag.create({
    data: { customerProfileId: profile.id, tag: "NEW_CUSTOMER" },
  });

  revalidatePath("/admin/customers");
  return { id: profile.id };
}

export async function adminUpdateCustomerProfile(
  customerProfileId: string,
  input: CustomerProfileInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(customerProfileSchema, input);
  if (!parsed.success) return { error: parsed.error };

  try {
    await db.customerProfile.update({
      where: { id: customerProfileId },
      data: profileData(parsed.data),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Another customer already uses this phone number." };
    }
    throw error;
  }

  revalidatePath(`/admin/customers/${customerProfileId}`);
  revalidatePath("/admin/customers");
}

export async function adminSetCustomerStatus(
  customerProfileId: string,
  status: CustomerStatusInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(customerStatusEnum, status);
  if (!parsed.success) return { error: parsed.error };

  await db.customerProfile.update({
    where: { id: customerProfileId },
    data: { status: parsed.data },
  });

  revalidatePath(`/admin/customers/${customerProfileId}`);
  revalidatePath("/admin/customers");
}

export async function adminAddCustomerPreference(
  customerProfileId: string,
  input: CustomerPreferenceInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(customerPreferenceSchema, input);
  if (!parsed.success) return { error: parsed.error };

  await db.customerPreference.create({
    data: { customerProfileId, type: parsed.data.type, label: parsed.data.label },
  });

  revalidatePath(`/admin/customers/${customerProfileId}`);
}

export async function adminDeleteCustomerPreference(
  customerProfileId: string,
  preferenceId: string
) {
  await requireAdmin();

  await db.customerPreference.deleteMany({
    where: { id: preferenceId, customerProfileId },
  });

  revalidatePath(`/admin/customers/${customerProfileId}`);
}

export async function adminUpdateCustomerAllergies(
  customerProfileId: string,
  input: CustomerAllergiesInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(customerAllergiesSchema, input);
  if (!parsed.success) return { error: parsed.error };
  const data = parsed.data;

  await db.$transaction([
    ...data.allergies.map(({ allergyId, checked, notes }) =>
      checked
        ? db.customerAllergy.upsert({
            where: {
              customerProfileId_allergyId: { customerProfileId, allergyId },
            },
            create: { customerProfileId, allergyId, notes: notes || null },
            update: { notes: notes || null },
          })
        : db.customerAllergy.deleteMany({
            where: { customerProfileId, allergyId },
          })
    ),
    db.customerProfile.update({
      where: { id: customerProfileId },
      data: { otherAllergies: data.otherAllergies || null },
    }),
  ]);

  revalidatePath(`/admin/customers/${customerProfileId}`);
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
