"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { authors, Meal, mealTypes, mealTypeLabels } from "@/lib/types";
import { displayDate } from "@/lib/dates";
import { MealEditor } from "@/components/MealEditor";

export function MealsByDate({ date }: { date: string }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/meals?date=${date}`, { cache: "no-store" });
    const data = await response.json();
    setMeals(data.meals || []);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const bySlot = useMemo(() => {
    return new Map(meals.map((meal) => [`${meal.meal_type}:${meal.author}`, meal]));
  }, [meals]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-leaf">{date}</p>
          <h1 className="text-2xl font-bold">{displayDate(date)}</h1>
        </div>
        {loading ? (
          <div className="inline-flex items-center gap-2 text-sm text-stone-500">
            <Loader2 className="animate-spin" size={16} />
            불러오는 중
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {mealTypes.map((mealType) => (
          <div key={mealType}>
            <h2 className="mb-2 text-sm font-bold">{mealTypeLabels[mealType]}</h2>
            <div className="grid gap-3">
              {authors.map((author) => (
                <MealEditor
                  key={`${mealType}:${author}:${bySlot.get(`${mealType}:${author}`)?.id || "empty"}`}
                  date={date}
                  mealType={mealType}
                  author={author}
                  meal={bySlot.get(`${mealType}:${author}`)}
                  onChanged={loadMeals}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
