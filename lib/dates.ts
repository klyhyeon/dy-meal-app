import { format, parseISO, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

export const DATE_FORMAT = "yyyy-MM-dd";

export function toDateKey(date: Date) {
  return format(date, DATE_FORMAT);
}

export function displayDate(dateKey: string, pattern = "M월 d일 EEEE") {
  return format(parseISO(dateKey), pattern, { locale: ko });
}

export function weekStart(dateKey?: string) {
  return toDateKey(startOfWeek(dateKey ? parseISO(dateKey) : new Date(), { weekStartsOn: 1 }));
}
