"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface CA {
  id: string;
  date: string;
  category: string;
  title: string;
  content: string;
  source: string | null;
}
interface CatStat {
  category: string;
  count: number;
}

const categoryColors: Record<string, string> = {
  National: "bg-blue-100 text-blue-700",
  International: "bg-purple-100 text-purple-700",
  Sports: "bg-emerald-100 text-emerald-700",
  Economy: "bg-amber-100 text-amber-700",
  "Science & Tech": "bg-cyan-100 text-cyan-700",
  Awards: "bg-rose-100 text-rose-700",
  "Govt Schemes": "bg-indigo-100 text-indigo-700",
};

function fmtDate(d: string): string {
  const dt = new Date(d + "T00:00:00");
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function monthLabel(m: string): string {
  const dt = new Date(m + "-01T00:00:00");
  return isNaN(dt.getTime()) ? m : dt.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

export default function CurrentAffairsPage() {
  const [items, setItems] = useState<CA[]>([]);
  const [categories, setCategories] = useState<CatStat[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (date) params.set("date", date);
      else if (month) params.set("month", month);
      const res = await fetch(`/api/current-affairs?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setItems(data.items ?? []);
      setCategories(data.categories ?? []);
      if (Array.isArray(data.months)) setMonths(data.months);
      if (Array.isArray(data.dates)) setDates(data.dates);
    } finally {
      setLoading(false);
    }
  }, [category, month, date]);

  useEffect(() => {
    load();
  }, [load]);

  // Group by date.
  const grouped = items.reduce<Record<string, CA[]>>((acc, it) => {
    (acc[it.date] = acc[it.date] || []).push(it);
    return acc;
  }, {});
  const groupedDates = Object.keys(grouped);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← Home
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">📰 Current Affairs</h1>
          <p className="mt-1 text-sm text-slate-300">
            Daily current affairs for SSC, Banking, Railways &amp; UPSC — read and revise. Free.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-5 px-6 py-8">
        {/* Date + month filters */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Pick a date</span>
            <select
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (e.target.value) setMonth("");
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="">Any date</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {fmtDate(d)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Month</span>
            <select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                if (e.target.value) setDate("");
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="">Latest</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </label>
          {(date || month) && (
            <button
              onClick={() => {
                setDate("");
                setMonth("");
              }}
              className="text-xs font-semibold text-examblue hover:underline"
            >
              Back to latest
            </button>
          )}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                category === "" ? "bg-examblue text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.category}
                onClick={() => setCategory(c.category)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  category === c.category ? "bg-examblue text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {c.category} ({c.count})
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No current affairs added yet. Check back soon — fresh updates are posted daily.
          </div>
        ) : (
          groupedDates.map((date) => (
            <section key={date}>
              <h2 className="mb-2 text-sm font-bold text-slate-500">{fmtDate(date)}</h2>
              <div className="space-y-3">
                {grouped[date].map((it) => (
                  <article key={it.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          categoryColors[it.category] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {it.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{it.title}</h3>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                      {it.content}
                    </p>
                    {it.source && isUrl(it.source) ? (
                      <a
                        href={it.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-examblue hover:underline"
                      >
                        Read full article ↗
                      </a>
                    ) : (
                      it.source && <p className="mt-2 text-xs text-slate-400">Source: {it.source}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
