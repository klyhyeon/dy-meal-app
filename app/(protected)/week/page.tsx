import { addDays } from "date-fns";
import { WeekTable } from "@/components/WeekTable";
import { weekStart } from "@/lib/dates";
import { listPlanItems } from "@/lib/plans";

export default async function WeekPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const start = weekStart(date);
  const end = addDays(new Date(`${start}T00:00:00`), 6);
  const plans = await listPlanItems({
    start,
    end: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`
  });

  return <WeekTable start={start} plans={plans} />;
}
