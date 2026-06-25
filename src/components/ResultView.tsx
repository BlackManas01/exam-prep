"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface SectionResult {
  sectionCode: string;
  sectionName: string;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
  scoredMarks: number;
  accuracy: number;
}
interface Summary {
  totalQuestions: number;
  totalMarks: number;
  scoredMarks: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  accuracy: number;
  sections: SectionResult[];
}
interface QuestionDetail {
  questionId: string;
  displayOrder: number;
  sectionCode: string;
  topic: string;
  stem: string;
  options: { id: string; text: string }[];
  selectedOptionId: string | null;
  correctOptionId: string | null;
  isAttempted: boolean;
  isCorrect: boolean;
  status: "correct" | "wrong" | "unattempted";
  explanation: string;
}
interface ResultData {
  attempt: {
    id: string;
    candidateName: string;
    level: string;
    durationSeconds: number;
    timeTakenSeconds: number;
  };
  exam: { code: string; name: string; shortName: string; sections: { code: string; name: string }[] };
  summary: Summary;
  questions: QuestionDetail[];
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

type Filter = "all" | "correct" | "wrong" | "unattempted";

export default function ResultView({ attemptId }: { attemptId: string }) {
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}/result`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load result");
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    })();
  }, [attemptId]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.questions;
    return data.questions.filter((q) => q.status === filter);
  }, [data, filter]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="rounded-lg bg-examblue px-4 py-2 text-sm font-semibold text-white">
          Back to home
        </Link>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Calculating your result…
      </div>
    );
  }

  const { summary, exam, attempt } = data;
  // Simple rank/clearing-probability heuristic derived from score percentage.
  const scorePct = summary.totalMarks > 0 ? (summary.scoredMarks / summary.totalMarks) * 100 : 0;
  const clearingProbability = Math.max(0, Math.min(99, Math.round((scorePct - 25) * 1.8)));

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← All exams
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{exam.name} — Result Analysis</h1>
          <p className="text-sm text-slate-300">
            {attempt.candidateName} · Level: {attempt.level.replace("_", " ")}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Score hero */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Your Score</p>
              <p className="text-4xl font-extrabold text-slate-900">
                {summary.scoredMarks}
                <span className="text-xl font-semibold text-slate-400">
                  {" "}
                  / {summary.totalMarks}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Correct" value={summary.correctCount} tone="green" />
              <Metric label="Wrong" value={summary.wrongCount} tone="red" />
              <Metric label="Unattempted" value={summary.unattemptedCount} tone="slate" />
              <Metric label="Accuracy" value={`${summary.accuracy}%`} tone="blue" />
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoTile
              label="Time Taken"
              value={fmtTime(attempt.timeTakenSeconds)}
              sub={`of ${fmtTime(attempt.durationSeconds)}`}
            />
            <InfoTile label="Score %" value={`${scorePct.toFixed(1)}%`} sub="of total marks" />
            <InfoTile
              label="Clearing Probability"
              value={`${clearingProbability}%`}
              sub="estimate from this attempt"
            />
          </div>
        </section>

        {/* Section-wise */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Section-wise Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2 font-semibold">Section</th>
                  <th className="px-4 py-2 font-semibold">Correct</th>
                  <th className="px-4 py-2 font-semibold">Wrong</th>
                  <th className="px-4 py-2 font-semibold">Skipped</th>
                  <th className="px-4 py-2 font-semibold">Score</th>
                  <th className="px-4 py-2 font-semibold">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {summary.sections.filter((s) => s.total > 0).map((s) => (
                  <tr key={s.sectionCode} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-800">{s.sectionName}</td>
                    <td className="px-4 py-2 text-green-700">{s.correct}</td>
                    <td className="px-4 py-2 text-red-600">{s.wrong}</td>
                    <td className="px-4 py-2 text-slate-500">{s.unattempted}</td>
                    <td className="px-4 py-2 font-semibold text-slate-800">{s.scoredMarks}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-examblue"
                            style={{ width: `${s.accuracy}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{s.accuracy.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <StrengthWeakness sections={summary.sections} />
        </section>

        {/* Detailed solutions */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Detailed Solutions</h2>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold">
              {(["all", "correct", "wrong", "unattempted"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-3 py-1.5 capitalize transition ${
                    filter === f ? "bg-white text-examblue shadow-sm" : "text-slate-500"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((q) => (
              <div key={q.displayOrder} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="whitespace-pre-line font-medium text-slate-900">
                    <span className="mr-2 text-slate-400">Q{q.displayOrder + 1}.</span>
                    {q.stem}
                  </p>
                  <StatusBadge status={q.status} />
                </div>
                <div className="mt-3 space-y-1.5">
                  {q.options.map((opt, i) => {
                    const isCorrect = opt.id === q.correctOptionId;
                    const isSelected = opt.id === q.selectedOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                          isCorrect
                            ? "border-green-300 bg-green-50 text-green-800"
                            : isSelected
                            ? "border-red-300 bg-red-50 text-red-800"
                            : "border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                        <span>{opt.text}</span>
                        {isCorrect && (
                          <span className="ml-auto text-xs font-semibold text-green-700">
                            ✓ Correct
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="ml-auto text-xs font-semibold text-red-600">
                            Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Explanation: </span>
                  {q.explanation}
                </div>
                <div className="mt-2 flex justify-end">
                  <ReportButton questionId={q.questionId} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center gap-3 pb-4">
          <Link
            href={`/exam/${exam.code}`}
            className="rounded-lg bg-examblue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Reattempt {exam.shortName}
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600"
          >
            Try another exam
          </Link>
          <Link
            href="/progress"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600"
          >
            📊 My Progress
          </Link>
        </div>
      </div>
    </main>
  );
}

function ReportButton({ questionId }: { questionId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  async function report() {
    if (state !== "idle") return;
    setState("sending");
    try {
      const reason = window.prompt(
        "What's wrong with this question? (optional — e.g. wrong answer, typo)"
      );
      await fetch(`/api/questions/${questionId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason ?? "" }),
      });
      setState("done");
    } catch {
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <span className="text-xs font-medium text-green-600">✓ Reported — thanks!</span>
    );
  }
  return (
    <button
      onClick={report}
      disabled={state === "sending"}
      className="text-xs font-medium text-slate-400 hover:text-red-600 disabled:opacity-50"
    >
      {state === "sending" ? "Reporting…" : "⚑ Report wrong answer"}
    </button>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "green" | "red" | "slate" | "blue";
}) {
  const tones: Record<string, string> = {
    green: "text-green-700",
    red: "text-red-600",
    slate: "text-slate-600",
    blue: "text-examblue",
  };
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-2 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-xl font-bold ${tones[tone]}`}>{value}</div>
    </div>
  );
}

function InfoTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: "correct" | "wrong" | "unattempted" }) {
  const map = {
    correct: "bg-green-100 text-green-700",
    wrong: "bg-red-100 text-red-700",
    unattempted: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function StrengthWeakness({ sections }: { sections: SectionResult[] }) {
  const attempted = sections.filter((s) => s.correct + s.wrong > 0);
  if (attempted.length === 0) return null;
  const sorted = [...attempted].sort((a, b) => b.accuracy - a.accuracy);
  const strength = sorted[0];
  const weakness = sorted[sorted.length - 1];
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
        <span className="font-semibold text-green-800">💪 Strongest area: </span>
        <span className="text-green-700">
          {strength.sectionName} ({strength.accuracy.toFixed(0)}% accuracy)
        </span>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
        <span className="font-semibold text-amber-800">📈 Needs work: </span>
        <span className="text-amber-700">
          {weakness.sectionName} ({weakness.accuracy.toFixed(0)}% accuracy)
        </span>
      </div>
    </div>
  );
}
