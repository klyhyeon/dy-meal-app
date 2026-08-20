import { addDays } from "date-fns";
import { WeekTable } from "@/components/WeekTable";
import { weekStart } from "@/lib/dates";
import { listPlanItems } from "@/lib/plans";

// 💡 필수: 주간 이동 시 서버 데이터 최신화 (캐시 방지)
export const dynamic = "force-dynamic";

export default async function WeekPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const start = weekStart(date); // 예: "2026-08-16"
  const end = addDays(new Date(`${start}T00:00:00`), 6);
  const plans = await listPlanItems({
    start,
    end: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`
  });

  // 💡 key={start}가 핵심 (날짜 변경 시 클라이언트 State 완전 리셋)
  return <WeekTable key={start} start={start} plans={plans} />;
}