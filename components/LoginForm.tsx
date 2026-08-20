"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    setLoading(false);
    if (!response.ok) {
      setError((await response.json()).error || "로그인할 수 없습니다.");
      return;
    }
    router.replace(searchParams.get("next") || "/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded border border-line bg-white p-5 shadow-sm">
      <h1 className="text-xl font-bold">식단 기록</h1>
      <p className="mt-1 text-sm text-stone-500">함께 쓰는 비밀번호를 입력하세요.</p>
      <input
        className="mt-5 w-full rounded border border-line px-3 py-2"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoFocus
      />
      <div className="mt-3 flex min-h-5 items-center justify-between gap-3">
        <span className="text-sm text-tomato">{error}</span>
        <button className="inline-flex items-center gap-2 rounded bg-leaf px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={loading}>
          <LogIn size={16} />
          들어가기
        </button>
      </div>
    </form>
  );
}
