"use client";

import Link from "next/link";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Meal } from "@/lib/types";

export function CalendarMonth({ month, meals }: { month: string; meals: Meal[] }) {
  const current = parseISO(`${month}-01`);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(current), { weekStartsOn: 1 })
  });
  const datesWithMeals = new Set(meals.map((meal) => meal.meal_date));

  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link className="rounded border border-line p-2 hover:bg-white" href={`/calendar?month=${format(subMonths(current, 1), "yyyy-MM")}`} title="이전 달">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">{format(current, "yyyy년 M월")}</h1>
        <Link className="rounded border border-line p-2 hover:bg-white" href={`/calendar?month=${format(addMonths(current, 1), "yyyy-MM")}`} title="다음 달">
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-line bg-white">
        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
          <div key={day} className="border-b border-r border-line px-2 py-2 text-center text-xs font-bold text-stone-500">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const active = datesWithMeals.has(dateKey);
          return (
            <Link
              key={dateKey}
              href={`/calendar/${dateKey}`}
              className={`flex aspect-square min-h-20 flex-col justify-between border-b border-r border-line p-2 hover:bg-oat ${
                isSameMonth(day, current) ? "text-ink" : "text-stone-300"
              }`}
            >
              <span className="text-sm font-semibold">{format(day, "d")}</span>
              {active ? <span className="h-2 w-2 rounded-full bg-tomato" /> : <span />}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
