"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LogOut, Table2 } from "lucide-react";

const items = [
  { href: "/week", label: "주간 예정표", icon: Table2 },
  { href: "/calendar", label: "식단 기록", icon: CalendarDays }
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <nav className="flex gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
                  active ? "bg-leaf text-white" : "text-stone-600 hover:bg-oat"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button className="rounded border border-line p-2 hover:bg-oat" onClick={logout} title="로그아웃">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
