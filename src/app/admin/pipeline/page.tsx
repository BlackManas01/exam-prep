"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EXAM_BLUEPRINTS } from "@/lib/examConfig";

interface QOption { text: string; isCorrect: boolean; }
interface QItem {
  id: string; stem: string; examCode: string; sectionCode: string;
  topic: string; difficulty: string; source: string; explanation: string;
  createdAt: string; options: QOption[];
}
interface SectionCount { examCode: string; sectionCode: string; count: number; }
interface QResponse { total: number; page: number; pageSize: number; totalPages: number; bySection: SectionCount[]; questions: QItem[]; }

const sourceColors: Record<string, string> = {
  SEED: "bg-slate-100 text-slate-600",
  AI: "bg-purple-100 text-purple-700",
  MANUAL: "bg-amber-100 text-amber-700",
};

function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function PipelinePage() {
  const [source, setSource] = useState("AI");
  const [days, setDays] = useState("0");
  const [examCode, setExamCode] = useState("");
  const [sectionCode, setSectionCode] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<QResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const sections = examCode ? EXAM_BLUEPRINTS.find((e) => e.code === examCode)?.sections ?? [] : [];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20", days });
      if (source) params.set("source", source);
      if (examCode) params.set("examCode", examCode);
      if (sectionCode) params.set("sectionCode", sectionCode);
      const res = await fetch(`/api/admin/recent?${params.toString()}`, { cache: "no-store" });
      setData(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [source, days, examCode, sectionCode, page]);

  useEffect(() => { load(); }, [load]);

  const examName = (c: string) => EXAM_BLUEPRINTS.find((e) => e.code === c)?.name ?? c;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link href="/admin" className="text-sm text-blue-300 hover:underline">← Back to admin</Link>
          <h1 className="mt-2 text-2xl font-bold">Pipeline — Recently Added</h1>
          <p className="text-sm text-slate-300">{data ? `${data.total} questions match` : "Loading…"}</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="text-sm font-medium text-slate-700">Exam
            <select value={examCode} onChange={(e) => { setExamCode(e.target.value); setSectionCode(""); setPage(1); }} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">All exams</option>
              {EXAM_BLUEPRINTS.map((e) => (<option key={e.code} value={e.code}>{e.name}</option>))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Section
            <select value={sectionCode} onChange={(e) => { setSectionCode(e.target.value); setPage(1); }} disabled={!examCode} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">
              <option value="">All sections</option>
              {sections.map((s) => (<option key={s.code} value={s.code}>{s.name}</option>))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Source
            <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="AI">AI (pipeline)</option>
              <option value="MANUAL">Hand-written</option>
              <option value="SEED">Built-in</option>
              <option value="">All</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Added within
            <select value={days} onChange={(e) => { setDays(e.target.value); setPage(1); }} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="0">Any time</option>
              <option value="1">Last 24h</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last 7 days</option>
            </select>
          </label>
          <button onClick={() => { setPage(1); load(); }} className="ml-auto rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            {loading ? "Loading…" : "Reload"}
          </button>
        </div>

        {data && data.bySection.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Where they&apos;re going</p>
            <div className="flex flex-wrap gap-2">
              {data.bySection.map((b) => (
                <span key={`${b.examCode}/${b.sectionCode}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {examName(b.examCode)} · {b.sectionCode}: <b>{b.count}</b>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {data?.questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900">
                  <span className="mr-2 text-slate-400">{(data.page - 1) * data.pageSize + idx + 1}.</span>{q.stem}
                </p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sourceColors[q.source] ?? "bg-slate-100 text-slate-600"}`}>{q.source}</span>
                  <span className="text-[10px] text-slate-400">{ago(q.createdAt)}</span>
                </div>
              </div>
              <div className="mt-2 grid gap-1">
                {q.options.map((o, i) => (
                  <span key={i} className={`text-sm ${o.isCorrect ? "font-semibold text-green-700" : "text-slate-600"}`}>{String.fromCharCode(65 + i)}. {o.text}</span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">{examName(q.examCode)} · {q.sectionCode} · {q.topic} · {q.difficulty}</p>
            </div>
          ))}
          {data && data.questions.length === 0 && <p className="text-center text-sm text-slate-500">No questions match these filters.</p>}
        </div>

        {data && data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-slate-600">Page {data.page} / {data.totalPages}</span>
            <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </main>
  );
}
