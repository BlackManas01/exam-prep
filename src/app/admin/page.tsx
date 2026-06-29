"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EXAM_BLUEPRINTS } from "@/lib/examConfig";

interface SectionStat {
  code: string;
  name: string;
  subject: string;
  total: number;
  active: number;
  aiPending: number;
}
interface ExamStat {
  code: string;
  name: string;
  sections: SectionStat[];
}
interface Stats {
  total: number;
  exams: ExamStat[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [delta, setDelta] = useState<number | null>(null);
  const prevTotalRef = useRef<number | null>(null);
  const [adminKey, setAdminKey] = useState("dev-admin");
  const [examCode, setExamCode] = useState(EXAM_BLUEPRINTS[0].code);
  const [sectionCode, setSectionCode] = useState(EXAM_BLUEPRINTS[0].sections[0].code);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD" | "EXPERT">("MEDIUM");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exam = useMemo(
    () => EXAM_BLUEPRINTS.find((e) => e.code === examCode)!,
    [examCode]
  );

  async function fetchStats(): Promise<Stats | null> {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      return (await res.json()) as Stats;
    } catch {
      return null;
    }
  }

  function applyStats(s: Stats) {
    // Only signal a change when the total actually moved (questions added).
    if (prevTotalRef.current != null && s.total > prevTotalRef.current) {
      const d = s.total - prevTotalRef.current;
      setDelta(d);
      setTimeout(() => setDelta(null), 3000);
      setLastUpdated(new Date());
    }
    if (prevTotalRef.current == null) setLastUpdated(new Date());
    prevTotalRef.current = s.total;
    setStats(s);
  }

  // Manual refresh — shows the spinner.
  async function loadStats() {
    setRefreshing(true);
    const s = await fetchStats();
    if (s) applyStats(s);
    setTimeout(() => setRefreshing(false), 300);
  }

  // Quiet background poll — no spinner; only updates when the count changes.
  async function silentLoad() {
    const s = await fetchStats();
    if (s) applyStats(s);
  }

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live auto-refresh: polls quietly and flashes a "+N" badge on new questions.
  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(silentLoad, 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  async function generate() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          examCode,
          sectionCode,
          topic: topic.trim() || undefined,
          difficulty,
          count,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Generation failed");
      setMessage(
        `Inserted ${data.inserted} new questions (returned ${data.returned}, valid ${data.valid}, duplicates ${data.duplicates}). They are inactive pending review.`
      );
      loadStats();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← Back to platform
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Admin · Question Bank</h1>
          <p className="text-sm text-slate-300">
            Total questions:{" "}
            <strong>{stats?.total ?? "…"}</strong>
            {delta != null && (
              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-300">
                +{delta} new
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-2">
        {/* AI generator */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800">AI Question Generator</h2>
          <p className="mt-1 text-sm text-slate-500">
            Generates questions with AI and stores them as <em>inactive</em> for review.
            Works with a <strong>free</strong> Gemini or Groq key (no card needed) — set
            <code className="rounded bg-slate-100 px-1">GEMINI_API_KEY</code> or
            <code className="rounded bg-slate-100 px-1">GROQ_API_KEY</code> in the server
            environment.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Exam
              <select
                value={examCode}
                onChange={(e) => {
                  setExamCode(e.target.value);
                  const ex = EXAM_BLUEPRINTS.find((x) => x.code === e.target.value)!;
                  setSectionCode(ex.sections[0].code);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {EXAM_BLUEPRINTS.map((e) => (
                  <option key={e.code} value={e.code}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Section
              <select
                value={sectionCode}
                onChange={(e) => setSectionCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {exam.sections.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Topic (optional)
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Indian Polity"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <div className="flex gap-3">
              <label className="flex-1 text-sm font-medium text-slate-700">
                Difficulty
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {["EASY", "MEDIUM", "HARD", "EXPERT"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="w-24 text-sm font-medium text-slate-700">
                Count
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Admin key
              <input
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            {message && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{message}</p>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}

            <button
              onClick={generate}
              disabled={loading}
              className="w-full rounded-lg bg-examblue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            >
              {loading ? "Generating…" : "Generate Questions"}
            </button>

            <Link
              href="/admin/questions"
              className="block rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              👁️ View / browse questions
            </Link>

            <Link
              href="/admin/pipeline"
              className="block rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              🆕 Pipeline — recently added
            </Link>

            <Link
              href="/admin/flags"
              className="block rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              ⚑ Reported questions
            </Link>

            <Link
              href="/admin/current-affairs"
              className="block rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              📰 Manage current affairs
            </Link>
          </div>
        </section>

        {/* Bank stats */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Question Bank</h2>
              <p className="text-xs text-slate-400">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : "Loading…"}
                {autoRefresh ? " · auto-refresh on" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh((v) => !v)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                  autoRefresh
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-slate-300 text-slate-500"
                }`}
                title="Toggle live auto-refresh"
              >
                {autoRefresh ? "Live" : "Paused"}
              </button>
              <button
                onClick={loadStats}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full border-2 border-slate-300 border-t-slate-600 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {stats?.exams.map((ex) => (
              <div key={ex.code}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {ex.name}
                </p>
                <table className="mt-1 w-full text-left text-xs">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-1 font-semibold">Section</th>
                      <th className="py-1 font-semibold">Active</th>
                      <th className="py-1 font-semibold">AI pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sections.map((s) => (
                      <tr key={s.code} className="border-t border-slate-100">
                        <td className="py-1 text-slate-700">{s.name}</td>
                        <td className="py-1 font-semibold text-slate-800">{s.active}</td>
                        <td className="py-1 text-amber-600">{s.aiPending || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
            <strong className="text-slate-600">Active</strong> = questions live in your
            tests. <strong className="text-slate-600">AI pending</strong> = AI questions
            saved but not yet activated (kept for review). New AI questions go live
            automatically, so this is usually “—”.
          </p>
        </section>
      </div>
    </main>
  );
}
