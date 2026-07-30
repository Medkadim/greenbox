import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const SUBSCRIPTION_PLANS = [
  { name: "Lunch Only — Weekly", type: "LUNCH_ONLY" as const, mealsPerWeek: 5, durationDays: 7, price: "450.00" },
  { name: "Lunch + Dinner — Weekly", type: "LUNCH_AND_DINNER" as const, mealsPerWeek: 10, durationDays: 7, price: "850.00" },
  { name: "Lunch Only — Monthly", type: "MONTHLY" as const, mealsPerWeek: 5, durationDays: 30, price: "1700.00" },
];

const ALLERGIES = ["Nuts", "Lactose", "Gluten", "Shellfish", "Eggs", "Soy"];

async function main() {
  for (const plan of SUBSCRIPTION_PLANS) {
    await db.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  for (const name of ALLERGIES) {
    await db.allergy.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
