"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EXAM_BLUEPRINTS } from "@/lib/examConfig";

interface QOption {
  text: string;
  isCorrect: boolean;
}
interface QItem {
  id: string;
  stem: string;
  topic: string;
  difficulty: string;
  source: string;
  explanation: string;
  options: QOption[];
}
interface QResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  questions: QItem[];
}

const sourceColors: Record<string, string> = {
  SEED: "bg-slate-100 text-slate-600",
  AI: "bg-purple-100 text-purple-700",
  MANUAL: "bg-amber-100 text-amber-700",
};

export default function BrowseQuestionsPage() {
  const [examCode, setExamCode] = useState(EXAM_BLUEPRINTS[0].code);
  const [sectionCode, setSectionCode] = useState(EXAM_BLUEPRINTS[0].sections[0].code);
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<QResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const exam = useMemo(() => EXAM_BLUEPRINTS.find((e) => e.code === examCode)!, [examCode]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        examCode,
        sectionCode,
        page: String(page),
        pageSize: "10",
      });
      if (source) params.set("source", source);
      const res = await fetch(`/api/admin/questions?${params.toString()}`, { cache: "no-store" });
      setData(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [examCode, sectionCode, source, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link href="/admin" className="text-sm text-blue-300 hover:underline">
            ← Back to admin
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Browse Questions</h1>
          <p className="text-sm text-slate-300">
            {data ? `${data.total} questions in this section` : "Loading…"}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="text-sm font-medium text-slate-700">
            Exam
            <select
              value={examCode}
              onChange={(e) => {
                setExamCode(e.target.value);
                const ex = EXAM_BLUEPRINTS.find((x) => x.code === e.target.value)!;
                setSectionCode(ex.sections[0].code);
                setPage(1);
              }}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {EXAM_BLUEPRINTS.map((e) => (
                <option key={e.code} value={e.code}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Section
            <select
              value={sectionCode}
              onChange={(e) => {
                setSectionCode(e.target.value);
                setPage(1);
              }}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {exam.sections.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Source
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="AI">AI-generated</option>
              <option value="SEED">Built-in</option>
            </select>
          </label>
          <button
            onClick={load}
            className="ml-auto rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {loading ? "Loading…" : "Reload"}
          </button>
        </div>

        {/* Questions */}
        <div className="mt-4 space-y-4">
          {data?.questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900">
                  <span className="mr-2 text-slate-400">
                    {(data.page - 1) * data.pageSize + idx + 1}.
                  </span>
                  {q.stem}
                </p>
                <div className="flex shrink-0 gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sourceColors[q.source] ?? "bg-slate-100 text-slate-600"}`}>
                    {q.source}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {q.difficulty}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {q.options.map((o, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                      o.isCorrect
                        ? "border-green-300 bg-green-50 text-green-800"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                    <span>{o.text}</span>
                    {o.isCorrect && <span className="ml-auto text-xs font-semibold">✓</span>}
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-md bg-slate-50 p-2.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Explanation: </span>
                {q.explanation}
              </p>
            </div>
          ))}
          {data && data.questions.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No questions found for this filter.
            </p>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-sm text-slate-500">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
