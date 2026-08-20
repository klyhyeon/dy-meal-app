import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { CalendarMonth } from "@/components/CalendarMonth";
import { listMeals } from "@/lib/meals";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: requestedMonth } = await searchParams;
  const month = requestedMonth || format(new Date(), "yyyy-MM");
  const date = parseISO(`${month}-01`);
  const meals = await listMeals({
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd")
  });

  return <CalendarMonth month={month} meals={meals} />;
}
