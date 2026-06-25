"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";

interface Recent {
  id: string;
  exam: string;
  examName: string;
  submittedAt: string;
  scoredMarks: number;
  totalMarks: number;
  accuracy: number;
  correct: number;
  wrong: number;
  unattempted: number;
  scorePct: number;
}
interface TopicStat {
  topic: string;
  attempted: number;
  correct: number;
  accuracy: number;
}
interface Progress {
  name: string;
  summary: { tests: number; questions: number; correct: number; accuracy: number; bestScorePct: number };
  recent: Recent[];
  weakTopics: TopicStat[];
  strongTopics: TopicStat[];
}

export default function ProgressPage() {
  const { signOut } = useClerk();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/progress", { cache: "no-store" });
      if (res.status === 401) {
        setUser(null);
        return;
      }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json());
      setUser(me.user ?? null);
      setAuthChecked(true);
      if (me.user) loadProgress();
    })();
  }, [loadProgress]);

  async function logout() {
    await signOut({ redirectUrl: "/" });
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <div>
            <Link href="/" className="text-sm text-blue-300 hover:underline">
              ← Home
            </Link>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">My Progress</h1>
            <p className="mt-1 text-sm text-slate-300">
              Track your tests, accuracy and weak topics — all free.
            </p>
          </div>
          {user && (
            <div className="text-right text-sm">
              <div className="font-semibold">{user.name}</div>
              <button onClick={logout} className="text-blue-300 hover:underline">
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        {!authChecked ? (
          <p className="py-10 text-center text-slate-500">Loading…</p>
        ) : !user ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">Log in or create a free account to track your progress.</p>
            <Link
              href="/sign-in"
              className="mt-4 inline-block rounded-lg bg-examblue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Log in / Sign up
            </Link>
          </div>
        ) : loading ? (
          <p className="py-10 text-center text-slate-500">Loading your stats…</p>
        ) : !data || data.summary.tests === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No submitted tests yet.{" "}
            <Link href="/practice" className="text-examblue hover:underline">
              Start practising →
            </Link>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Tests taken" value={data.summary.tests} tone="blue" />
              <Stat label="Questions solved" value={data.summary.questions} tone="slate" />
              <Stat label="Overall accuracy" value={`${data.summary.accuracy}%`} tone="green" />
              <Stat label="Best score" value={`${data.summary.bestScorePct}%`} tone="amber" />
            </section>

            {/* Accuracy trend (last attempts, oldest→newest) */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Accuracy trend (recent tests)
              </h2>
              <div className="flex items-end gap-1.5" style={{ height: 120 }}>
                {[...data.recent].reverse().map((r) => (
                  <div key={r.id} className="flex h-full flex-1 flex-col items-center justify-end" title={`${r.exam}: ${r.accuracy}%`}>
                    <div
                      className="w-full rounded-t bg-examblue/80"
                      style={{ height: `${Math.max(3, r.accuracy)}%` }}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Each bar is one test’s accuracy. Aim to keep the bars rising. 📈
              </p>
            </section>

            {/* Weak + strong topics */}
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-amber-200 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-amber-700">📈 Focus areas (weakest topics)</h2>
                {data.weakTopics.length === 0 ? (
                  <p className="text-sm text-slate-400">Solve a few more questions to see topic insights.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.weakTopics.map((t) => (
                      <TopicRow key={t.topic} t={t} weak />
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-green-200 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-green-700">💪 Strong topics</h2>
                {data.strongTopics.length === 0 ? (
                  <p className="text-sm text-slate-400">Keep practising to build strengths.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.strongTopics.map((t) => (
                      <TopicRow key={t.topic} t={t} />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Recent attempts */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recent tests
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Exam</th>
                      <th className="px-3 py-2 font-semibold">Date</th>
                      <th className="px-3 py-2 font-semibold">Score</th>
                      <th className="px-3 py-2 font-semibold">Accuracy</th>
                      <th className="px-3 py-2 font-semibold">C/W/Skip</th>
                      <th className="px-3 py-2 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium text-slate-800">{r.exam}</td>
                        <td className="px-3 py-2 text-slate-500">
                          {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-800">
                          {r.scoredMarks}/{r.totalMarks}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{r.accuracy}%</td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          <span className="text-green-700">{r.correct}</span> /{" "}
                          <span className="text-red-600">{r.wrong}</span> /{" "}
                          <span className="text-slate-500">{r.unattempted}</span>
                        </td>
                        <td className="px-3 py-2">
                          <Link href={`/result/${r.id}`} className="text-xs font-semibold text-examblue hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="flex flex-wrap justify-center gap-3 pb-4">
              <Link
                href="/practice"
                className="rounded-lg bg-examblue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Practise your weak topics →
              </Link>
              <Link
                href="/review"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                📕 Review your mistakes
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  const tones: Record<string, string> = {
    blue: "text-examblue",
    green: "text-green-700",
    amber: "text-amber-600",
    slate: "text-slate-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-2xl font-bold ${tones[tone]}`}>{value}</div>
    </div>
  );
}

function TopicRow({ t, weak }: { t: TopicStat; weak?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-40 shrink-0 truncate text-sm text-slate-700" title={t.topic}>
        {t.topic}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full ${weak ? "bg-amber-500" : "bg-green-500"}`}
          style={{ width: `${t.accuracy}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-xs text-slate-500">
        {t.accuracy}% ({t.correct}/{t.attempted})
      </span>
    </li>
  );
}
