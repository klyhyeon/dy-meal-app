export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
export const authors = ["me", "wife"] as const;

export type MealType = (typeof mealTypes)[number];
export type Author = (typeof authors)[number];

export type Meal = {
  id: string;
  meal_date: string;
  meal_type: MealType;
  author: Author;
  content: string;
  created_at: string;
  updated_at: string;
};

export type MealInput = Pick<Meal, "meal_date" | "meal_type" | "author" | "content">;

export type PlanItem = {
  id: string;
  planned_date: string;
  meal_type: MealType;
  content: string;
  created_at: string;
  updated_at: string;
};

export type PlanItemInput = Pick<PlanItem, "planned_date" | "meal_type" | "content">;

export const mealTypeLabels: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식"
};

export const authorLabels: Record<Author, string> = {
  me: "나",
  wife: "와이프"
};
