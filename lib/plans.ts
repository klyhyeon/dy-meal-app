import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { mealTypes, PlanItem, PlanItemInput } from "@/lib/types";

const localStorePath = path.join(process.cwd(), "data", "weekly-plans.json");

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function validate(input: Partial<PlanItemInput>) {
  if (!input.planned_date || !/^\d{4}-\d{2}-\d{2}$/.test(input.planned_date)) {
    throw new Error("planned_date must be YYYY-MM-DD");
  }
  if (!input.meal_type || !mealTypes.includes(input.meal_type)) {
    throw new Error("invalid meal_type");
  }
  if (!input.content?.trim()) {
    throw new Error("content is required");
  }
}

async function readLocal(): Promise<PlanItem[]> {
  try {
    return JSON.parse(await fs.readFile(localStorePath, "utf8")) as PlanItem[];
  } catch {
    return [];
  }
}

async function writeLocal(items: PlanItem[]) {
  await fs.mkdir(path.dirname(localStorePath), { recursive: true });
  await fs.writeFile(localStorePath, JSON.stringify(items, null, 2));
}

export async function listPlanItems(params: { date?: string; start?: string; end?: string }) {
  const client = supabase();
  if (client) {
    let query = client.from("weekly_plan_items").select("*").order("planned_date").order("meal_type");
    if (params.date) query = query.eq("planned_date", params.date);
    if (params.start) query = query.gte("planned_date", params.start);
    if (params.end) query = query.lte("planned_date", params.end);
    const { data, error } = await query;
    if (error) throw error;
    return data as PlanItem[];
  }

  const items = await readLocal();
  return items
    .filter((item) => !params.date || item.planned_date === params.date)
    .filter((item) => !params.start || item.planned_date >= params.start)
    .filter((item) => !params.end || item.planned_date <= params.end)
    .sort((a, b) => `${a.planned_date}${a.meal_type}`.localeCompare(`${b.planned_date}${b.meal_type}`));
}

export async function createPlanItem(input: PlanItemInput) {
  validate(input);
  const client = supabase();
  if (client) {
    const { data, error } = await client
      .from("weekly_plan_items")
      .upsert(
        { ...input, content: input.content.trim(), updated_at: new Date().toISOString() },
        { onConflict: "planned_date,meal_type" }
      )
      .select("*")
      .single();
    if (error) throw error;
    return data as PlanItem;
  }

  const now = new Date().toISOString();
  const items = await readLocal();
  const item: PlanItem = {
    id: crypto.randomUUID(),
    ...input,
    content: input.content.trim(),
    created_at: now,
    updated_at: now
  };
  const withoutSameSlot = items.filter((existing) => existing.planned_date !== item.planned_date || existing.meal_type !== item.meal_type);
  await writeLocal([...withoutSameSlot, item]);
  return item;
}

export async function updatePlanItem(id: string, content: string) {
  if (!content.trim()) throw new Error("content is required");
  const client = supabase();
  if (client) {
    const { data, error } = await client
      .from("weekly_plan_items")
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as PlanItem;
  }

  const items = await readLocal();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("plan item not found");
  items[index] = { ...items[index], content: content.trim(), updated_at: new Date().toISOString() };
  await writeLocal(items);
  return items[index];
}

export async function deletePlanItem(id: string) {
  const client = supabase();
  if (client) {
    const { error } = await client.from("weekly_plan_items").delete().eq("id", id);
    if (error) throw error;
    return;
  }

  await writeLocal((await readLocal()).filter((item) => item.id !== id));
}
