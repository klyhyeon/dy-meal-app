"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Author, authorLabels, Meal, MealType, mealTypeLabels } from "@/lib/types";

type Props = {
  date: string;
  mealType: MealType;
  author: Author;
  meal?: Meal;
  onChanged: () => void;
};

export function MealEditor({ date, mealType, author, meal, onChanged }: Props) {
  const [editing, setEditing] = useState(!meal);
  const [content, setContent] = useState(meal?.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setContent(meal?.content || "");
    setEditing(!meal);
    setError("");
  }, [meal]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const method = meal ? "PATCH" : "POST";
    const body = meal ? { id: meal.id, content } : { meal_date: date, meal_type: mealType, author, content };

    const response = await fetch("/api/meals", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    setSaving(false);
    if (!response.ok) {
      setError((await response.json()).error || "저장하지 못했습니다.");
      return;
    }
    setEditing(false);
    onChanged();
  }

  async function remove() {
    if (!meal) return;
    setSaving(true);
    await fetch(`/api/meals?id=${meal.id}`, { method: "DELETE" });
    setSaving(false);
    onChanged();
  }

  if (!editing && meal) {
    return (
      <div className="min-h-[118px] rounded border border-line bg-white p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-leaf">{authorLabels[author]}</span>
          <div className="flex gap-1">
            <button className="rounded border border-line p-1.5 hover:bg-oat" onClick={() => setEditing(true)} title="수정">
              <Pencil size={15} />
            </button>
            <button className="rounded border border-line p-1.5 hover:bg-oat" onClick={remove} disabled={saving} title="삭제">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{meal.content}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="min-h-[118px] rounded border border-dashed border-line bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-stone-600">
          {authorLabels[author]} · {mealTypeLabels[mealType]}
        </span>
        {meal ? (
          <button className="rounded border border-line p-1.5 hover:bg-oat" type="button" onClick={() => setEditing(false)} title="취소">
            <X size={15} />
          </button>
        ) : null}
      </div>
      <textarea
        className="h-16 w-full resize-none rounded border border-line px-2 py-1.5 text-sm"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="무엇을 먹었나요?"
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-tomato">{error}</span>
        <button className="inline-flex items-center gap-1 rounded bg-leaf px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50" disabled={saving}>
          {meal ? <Save size={14} /> : <Plus size={14} />}
          저장
        </button>
      </div>
    </form>
  );
}
