import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { authors, mealTypes, Meal, MealInput } from "@/lib/types";

const localStorePath = path.join(process.cwd(), "data", "meals.json");

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function validate(input: Partial<MealInput>) {
  if (!input.meal_date || !/^\d{4}-\d{2}-\d{2}$/.test(input.meal_date)) {
    throw new Error("meal_date must be YYYY-MM-DD");
  }
  if (!input.meal_type || !mealTypes.includes(input.meal_type)) {
    throw new Error("invalid meal_type");
  }
  if (!input.author || !authors.includes(input.author)) {
    throw new Error("invalid author");
  }
  if (!input.content?.trim()) {
    throw new Error("content is required");
  }
}

async function readLocal(): Promise<Meal[]> {
  try {
    return JSON.parse(await fs.readFile(localStorePath, "utf8")) as Meal[];
  } catch {
    return [];
  }
}

async function writeLocal(meals: Meal[]) {
  await fs.mkdir(path.dirname(localStorePath), { recursive: true });
  await fs.writeFile(localStorePath, JSON.stringify(meals, null, 2));
}

export async function listMeals(params: { date?: string; start?: string; end?: string }) {
  const client = supabase();
  if (client) {
    let query = client.from("meals").select("*").order("meal_date").order("meal_type");
    if (params.date) query = query.eq("meal_date", params.date);
    if (params.start) query = query.gte("meal_date", params.start);
    if (params.end) query = query.lte("meal_date", params.end);
    const { data, error } = await query;
    if (error) throw error;
    return data as Meal[];
  }

  const meals = await readLocal();
  return meals
    .filter((meal) => !params.date || meal.meal_date === params.date)
    .filter((meal) => !params.start || meal.meal_date >= params.start)
    .filter((meal) => !params.end || meal.meal_date <= params.end)
    .sort((a, b) => `${a.meal_date}${a.meal_type}${a.author}`.localeCompare(`${b.meal_date}${b.meal_type}${b.author}`));
}

export async function createMeal(input: MealInput) {
  validate(input);
  const now = new Date().toISOString();
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("meals").insert(input).select("*").single();
    if (error) throw error;
    return data as Meal;
  }

  const meals = await readLocal();
  const meal: Meal = { id: crypto.randomUUID(), ...input, content: input.content.trim(), created_at: now, updated_at: now };
  await writeLocal([...meals, meal]);
  return meal;
}

export async function updateMeal(id: string, content: string) {
  if (!content.trim()) throw new Error("content is required");
  const client = supabase();
  if (client) {
    const { data, error } = await client
      .from("meals")
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Meal;
  }

  const meals = await readLocal();
  const index = meals.findIndex((meal) => meal.id === id);
  if (index === -1) throw new Error("meal not found");
  meals[index] = { ...meals[index], content: content.trim(), updated_at: new Date().toISOString() };
  await writeLocal(meals);
  return meals[index];
}

export async function deleteMeal(id: string) {
  const client = supabase();
  if (client) {
    const { error } = await client.from("meals").delete().eq("id", id);
    if (error) throw error;
    return;
  }

  await writeLocal((await readLocal()).filter((meal) => meal.id !== id));
}
