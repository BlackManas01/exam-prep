"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface WrongQ {
  questionId: string;
  examCode: string;
  exam: string;
  sectionCode: string;
  topic: string;
  stem: string;
  options: { text: string; isCorrect: boolean }[];
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}
interface ExamGroup {
  examCode: string;
  exam: string;
  count: number;
  questionIds: string[];
}
interface ReviewData {
  total: number;
  exams: ExamGroup[];
  questions: WrongQ[];
}

export default function ReviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [examFilter, setExamFilter] = useState("");

  const loadReview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/review", { cache: "no-store" });
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
      if (me.user) loadReview();
    })();
  }, [loadReview]);

  async function rePractice(examCode: string, questionIds: string[]) {
    setStarting(examCode);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examCode, questionIds: questionIds.slice(0, 100) }),
      });
      const d = await res.json();
      if (res.ok && d.attemptId) router.push(`/test/${d.attemptId}`);
      else setStarting(null);
    } catch {
      setStarting(null);
    }
  }

  const filtered = data?.questions.filter((q) => !examFilter || q.examCode === examFilter) ?? [];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← Home
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">📕 Review Mistakes</h1>
          <p className="mt-1 text-sm text-slate-300">
            Every question you got wrong, with the correct answer & explanation. Learn it, then
            re-practice. This is how you actually improve.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-5 px-6 py-8">
        {!authChecked ? (
          <p className="py-10 text-center text-slate-500">Loading…</p>
        ) : !user ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">Log in to see and re-practice your mistakes.</p>
            <Link
              href="/sign-in"
              className="mt-4 inline-block rounded-lg bg-examblue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Log in / Sign up
            </Link>
          </div>
        ) : loading ? (
          <p className="py-10 text-center text-slate-500">Loading your mistakes…</p>
        ) : !data || data.total === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No mistakes recorded yet — take a test and any wrong answers will appear here to revise.{" "}
            <Link href="/practice" className="text-examblue hover:underline">
              Start practising →
            </Link>
          </div>
        ) : (
          <>
            {/* Re-practice buttons per exam */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Re-practice your wrong questions
              </h2>
              <p className="mb-3 text-xs text-slate-400">
                {data.total} wrong question{data.total === 1 ? "" : "s"} saved. Re-attempt them in a
                fresh timed test (up to 100 at a time).
              </p>
              <div className="flex flex-wrap gap-2">
                {data.exams.map((e) => (
                  <button
                    key={e.examCode}
                    onClick={() => rePractice(e.examCode, e.questionIds)}
                    disabled={starting === e.examCode}
                    className="rounded-lg bg-examblue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
                  >
                    {starting === e.examCode ? "Starting…" : `Re-practice ${e.exam} (${e.count})`}
                  </button>
                ))}
              </div>
            </section>

            {/* Exam filter */}
            {data.exams.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setExamFilter("")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    examFilter === "" ? "bg-examblue text-white" : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  All ({data.total})
                </button>
                {data.exams.map((e) => (
                  <button
                    key={e.examCode}
                    onClick={() => setExamFilter(e.examCode)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      examFilter === e.examCode ? "bg-examblue text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {e.exam} ({e.count})
                  </button>
                ))}
              </div>
            )}

            {/* Wrong question list with answers + explanations */}
            <div className="space-y-4">
              {filtered.map((q) => (
                <article key={q.questionId} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 text-xs text-slate-400">
                    {q.exam} · {q.topic}
                  </div>
                  <p className="whitespace-pre-line font-medium text-slate-900">{q.stem}</p>
                  <div className="mt-3 space-y-1.5">
                    {q.options.map((o, i) => {
                      const isCorrect = o.isCorrect;
                      const isYours = o.text === q.yourAnswer && !o.isCorrect;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                            isCorrect
                              ? "border-green-300 bg-green-50 text-green-800"
                              : isYours
                              ? "border-red-300 bg-red-50 text-red-800"
                              : "border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                          <span>{o.text}</span>
                          {isCorrect && <span className="ml-auto text-xs font-semibold text-green-700">✓ Correct</span>}
                          {isYours && <span className="ml-auto text-xs font-semibold text-red-600">Your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Explanation: </span>
                    {q.explanation}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
