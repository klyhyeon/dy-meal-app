"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 💡 useRouter 추가
import { addDays, format, getDay, parseISO, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { MealType, mealTypeLabels, PlanItem } from "@/lib/types";
import { displayDate } from "@/lib/dates";

const planMealTypes: MealType[] = ["breakfast", "lunch", "dinner"];
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function weekdayColor(dayIndex: number) {
  // date-fns getDay(): 0 = 일요일, 6 = 토요일
  if (dayIndex === 0) return "text-red-500";
  if (dayIndex === 6) return "text-blue-500";
  return "text-ink";
}

type EditingSlot = {
  date: string;
  mealType: MealType;
};

export function WeekTable({ start, plans }: { start: string; plans: PlanItem[] }) {
  const router = useRouter();

  // 💡 start는 이미 weekStart를 거쳐온 YYYY-MM-DD 형태이므로 직접 parse
  const currentStart = parseISO(start);
  const weekStartKey = start; // 이미 시작 날짜 문자열임
  const days = Array.from({ length: 7 }, (_, index) => addDays(currentStart, index));

  const [items, setItems] = useState(plans);
  const [editing, setEditing] = useState<EditingSlot | null>(null);

  // props 변경 시 state 동기화
  useEffect(() => {
    setItems(plans);
    setEditing(null);
  }, [plans, start]);

  const bySlot = useMemo(() => {
    return new Map(items.map((item) => [`${item.planned_date}:${item.meal_type}`, item]));
  }, [items]);

  // 💡 reload 시 현재 주간 기준 데이터 재요청
  async function reload() {
    const endKey = format(addDays(currentStart, 6), "yyyy-MM-dd");
    const response = await fetch(`/api/plans?start=${weekStartKey}&end=${endKey}`, { cache: "no-store" });
    const data = await response.json();
    setItems(data.plans || []);
  }

  // 💡 이전/다음 주 이동 처리
  const navigateWeek = (offsetDays: number) => {
    const targetDate = format(addDays(currentStart, offsetDays), "yyyy-MM-dd");
    router.push(`/week?date=${targetDate}`);
    router.refresh();
  };

  // 💡 여기서부터 return 문 시작!
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          className="rounded border border-line p-2 hover:bg-white"
          onClick={() => navigateWeek(-7)}
          title="이전 주"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold">{displayDate(weekStartKey, "M월 d일")} 주간 예정표</h1>
        <button
          className="rounded border border-line p-2 hover:bg-white"
          onClick={() => navigateWeek(7)}
          title="다음 주"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-24 border-b border-r border-line bg-oat px-3 py-3 text-left">구분</th>
              {days.map((day) => {
                const dow = getDay(day);
                return (
                  <th key={day.toISOString()} className="border-b border-r border-line bg-oat px-3 py-3 text-left">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-xs font-bold ${weekdayColor(dow)}`}>{WEEKDAY_LABELS[dow]}</span>
                      <span className="font-semibold text-ink">{format(day, "M/d")}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {planMealTypes.map((mealType) => (
              <tr key={mealType}>
                <th className="border-b border-r border-line px-3 py-3 text-left align-top text-stone-500">{mealTypeLabels[mealType]}</th>
                {days.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const item = bySlot.get(`${dateKey}:${mealType}`);
                  const isEditing = editing?.date === dateKey && editing.mealType === mealType;
                  return (
                    <td key={dateKey} className="h-32 border-b border-r border-line bg-oat/20 p-2 align-top">
                      {isEditing ? (
                        <PlanCellForm
                          item={item}
                          date={dateKey}
                          mealType={mealType}
                          onCancel={() => setEditing(null)}
                          onSaved={() => {
                            setEditing(null);
                            reload();
                          }}
                        />
                      ) : item ? (
                        <PlanCell item={item} onEdit={() => setEditing({ date: dateKey, mealType })} onDeleted={reload} />
                      ) : (
                        <EmptyPlanCell onAdd={() => setEditing({ date: dateKey, mealType })} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EmptyPlanCell({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex min-h-28 items-center justify-center">
      <button
        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-stone-300 px-3 py-2 text-xs font-semibold text-stone-400 transition-colors hover:border-leaf hover:bg-white hover:text-leaf"
        type="button"
        onClick={onAdd}
      >
        <Plus size={14} />
        작성
      </button>
    </div>
  );
}

function PlanCell({ item, onEdit, onDeleted }: { item: PlanItem; onEdit: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    await fetch(`/api/plans?id=${item.id}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted();
  }

  return (
    <div className="group flex min-h-28 flex-col justify-between gap-3 rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-line/60">
      <div className="flex items-start gap-1.5">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
        <p className="whitespace-pre-wrap text-[13px] leading-5 text-ink">{item.content}</p>
      </div>
      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button className="rounded-md p-1.5 text-stone-400 hover:bg-oat hover:text-ink" type="button" onClick={onEdit} title="수정">
          <Pencil size={13} />
        </button>
        <button
          className="rounded-md p-1.5 text-stone-400 hover:bg-oat hover:text-tomato disabled:opacity-50"
          type="button"
          onClick={remove}
          disabled={deleting}
          title="삭제"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function PlanCellForm({
  item,
  date,
  mealType,
  onCancel,
  onSaved
}: {
  item?: PlanItem;
  date: string;
  mealType: MealType;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState(item?.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/plans", {
      method: item ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item ? { id: item.id, content } : { planned_date: date, meal_type: mealType, content })
    });
    setSaving(false);
    if (!response.ok) {
      setError((await response.json()).error || "저장하지 못했습니다.");
      return;
    }
    onSaved();
  }

  return (
    <form className="flex min-h-28 flex-col gap-2 rounded-lg bg-white p-2 shadow-sm ring-1 ring-leaf/40" onSubmit={submit}>
      <textarea
        className="h-20 w-full resize-none rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="예정 메뉴"
        autoFocus
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-tomato">{error}</span>
        <div className="flex gap-1">
          <button className="rounded-md p-1.5 text-stone-400 hover:bg-oat hover:text-ink" type="button" onClick={onCancel} title="취소">
            <X size={14} />
          </button>
          <button className="rounded-md bg-leaf p-1.5 text-white shadow-sm disabled:opacity-50" disabled={saving} title={item ? "저장" : "추가"}>
            {item ? <Save size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>
    </form>
  );
}