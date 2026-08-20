"use client";

import Link from "next/link";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, getDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Meal } from "@/lib/types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function weekdayColor(dayIndex: number) {
  // date-fns getDay(): 0 = 일요일, 6 = 토요일
  if (dayIndex === 0) return "text-red-500";
  if (dayIndex === 6) return "text-blue-500";
  return "text-ink";
}

function summarizeByAuthor(meals: Meal[], author: "me" | "wife") {
  return meals
    .filter((meal) => meal.author === author)
    .map((meal) => meal.content)
    .join(", ");
}

export function CalendarMonth({ month, meals }: { month: string; meals: Meal[] }) {
  const current = parseISO(`${month}-01`);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(current), { weekStartsOn: 0 })
  });

  const mealsByDate = new Map<string, Meal[]>();
  for (const meal of meals) {
    const list = mealsByDate.get(meal.meal_date) ?? [];
    list.push(meal);
    mealsByDate.set(meal.meal_date, list);
  }

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
        {WEEKDAY_LABELS.map((day, idx) => (
          <div
            key={day}
            className={`border-b border-r border-line px-2 py-2 text-center text-xs font-bold ${
              idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-stone-500"
            }`}
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayMeals = mealsByDate.get(dateKey) ?? [];
          const meText = summarizeByAuthor(dayMeals, "me");
          const wifeText = summarizeByAuthor(dayMeals, "wife");
          const inMonth = isSameMonth(day, current);
          const dow = getDay(day);

          return (
            <Link
              key={dateKey}
              href={`/calendar/${dateKey}`}
              className={`flex aspect-square min-h-20 flex-col gap-1 border-b border-r border-line p-2 hover:bg-oat ${
                inMonth ? "" : "opacity-40"
              }`}
            >
              <span className={`text-sm font-semibold ${inMonth ? weekdayColor(dow) : "text-stone-300"}`}>
                {format(day, "d")}
              </span>

              <div className="flex flex-col gap-0.5 overflow-hidden">
                {meText && (
                  <div className="flex items-center gap-1 text-[10px] leading-tight text-ink">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span className="truncate">{meText}</span>
                  </div>
                )}
                {wifeText && (
                  <div className="flex items-center gap-1 text-[10px] leading-tight text-ink">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500" />
                    <span className="truncate">{wifeText}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}