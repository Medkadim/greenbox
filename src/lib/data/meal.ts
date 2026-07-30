import { db } from "@/lib/db";

export function listMeals() {
  return db.meal.findMany({
    include: { recipe: { include: { ingredients: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function listActiveMeals() {
  return db.meal.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export function getMealById(id: string) {
  return db.meal.findUnique({
    where: { id },
    include: {
      recipe: {
        include: {
          ingredients: { include: { ingredient: true }, orderBy: { id: "asc" } },
        },
      },
    },
  });
}

export function listIngredients() {
  return db.ingredient.findMany({ orderBy: { name: "asc" } });
}
