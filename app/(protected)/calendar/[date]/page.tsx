import { MealsByDate } from "@/components/MealsByDate";

export default async function DatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <MealsByDate date={date} />;
}
