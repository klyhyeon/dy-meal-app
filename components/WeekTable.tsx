"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { addDays, format, parseISO, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { MealType, mealTypeLabels, PlanItem } from "@/lib/types";
import { displayDate } from "@/lib/dates";

const planMealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

type EditingSlot = {
  date: string;
  mealType: MealType;
};

export function WeekTable({ start, plans }: { start: string; plans: PlanItem[] }) {
  const startDate = parseISO(start);
  const days = Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
  const [items, setItems] = useState(plans);
  const [editing, setEditing] = useState<EditingSlot | null>(null);

  const bySlot = useMemo(() => {
    return new Map(items.map((item) => [`${item.planned_date}:${item.meal_type}`, item]));
  }, [items]);

  async function reload() {
    const end = format(addDays(startDate, 6), "yyyy-MM-dd");
    const response = await fetch(`/api/plans?start=${start}&end=${end}`, { cache: "no-store" });
    const data = await response.json();
    setItems(data.plans || []);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link className="rounded border border-line p-2 hover:bg-white" href={`/week?date=${format(subDays(startDate, 7), "yyyy-MM-dd")}`} title="이전 주">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">{displayDate(start, "M월 d일")} 주간 예정표</h1>
        <Link className="rounded border border-line p-2 hover:bg-white" href={`/week?date=${format(addDays(startDate, 7), "yyyy-MM-dd")}`} title="다음 주">
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-line bg-white">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-24 border-b border-r border-line bg-oat px-3 py-3 text-left">구분</th>
              {days.map((day) => (
                <th key={day.toISOString()} className="border-b border-r border-line bg-oat px-3 py-3 text-left">
                  {format(day, "M/d")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planMealTypes.map((mealType) => (
              <tr key={mealType}>
                <th className="border-b border-r border-line px-3 py-3 text-left align-top">{mealTypeLabels[mealType]}</th>
                {days.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const item = bySlot.get(`${dateKey}:${mealType}`);
                  const isEditing = editing?.date === dateKey && editing.mealType === mealType;
                  return (
                    <td key={dateKey} className="h-32 border-b border-r border-line p-2 align-top">
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
        className="inline-flex items-center gap-1 rounded border border-line px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-oat hover:text-ink"
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
    <div className="flex min-h-28 flex-col justify-between gap-3">
      <p className="whitespace-pre-wrap leading-5">{item.content}</p>
      <div className="flex justify-end gap-1">
        <button className="rounded border border-line p-1.5 hover:bg-oat" type="button" onClick={onEdit} title="수정">
          <Pencil size={14} />
        </button>
        <button className="rounded border border-line p-1.5 hover:bg-oat disabled:opacity-50" type="button" onClick={remove} disabled={deleting} title="삭제">
          <Trash2 size={14} />
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
    <form className="flex min-h-28 flex-col gap-2" onSubmit={submit}>
      <textarea
        className="h-20 w-full resize-none rounded border border-line px-2 py-1.5 text-sm"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="예정 메뉴"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-tomato">{error}</span>
        <div className="flex gap-1">
          <button className="rounded border border-line p-1.5 hover:bg-oat" type="button" onClick={onCancel} title="취소">
            <X size={14} />
          </button>
          <button className="rounded bg-leaf p-1.5 text-white disabled:opacity-50" disabled={saving} title={item ? "저장" : "추가"}>
            {item ? <Save size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>
    </form>
  );
}
