"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface FlagOption {
  text: string;
  isCorrect: boolean;
}
interface FlagQuestion {
  examCode: string;
  sectionCode: string;
  topic: string;
  source: string;
  stem: string;
  options: FlagOption[];
}
interface FlagItem {
  questionId: string;
  reason: string | null;
  at: string;
  question: FlagQuestion | null;
}

const sourceColors: Record<string, string> = {
  SEED: "bg-slate-100 text-slate-600",
  AI: "bg-purple-100 text-purple-700",
  MANUAL: "bg-amber-100 text-amber-700",
};

export default function FlagsPage() {
  const [adminKey, setAdminKey] = useState("dev-admin");
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/flags", {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load");
      setFlags(json.flags ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(questionId: string, action: "dismiss" | "delete") {
    if (action === "delete" && !window.confirm("Permanently delete this question from the bank?")) {
      return;
    }
    setBusy(questionId);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ questionId, action }),
      });
      if (res.ok) {
        setFlags((prev) => prev.filter((f) => f.questionId !== questionId));
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link href="/admin" className="text-sm text-blue-300 hover:underline">
            ← Admin dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Reported Questions</h1>
          <p className="text-sm text-slate-300">
            Questions students flagged as wrong. Delete the bad ones or dismiss false alarms.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-4 px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="text-sm font-medium text-slate-600">Admin key</label>
          <input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
          <button
            onClick={load}
            className="rounded-md bg-examblue px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Refresh
          </button>
          <span className="ml-auto text-sm text-slate-500">
            {flags.length} pending report{flags.length === 1 ? "" : "s"}
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-slate-500">Loading…</p>
        ) : flags.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            🎉 No reported questions. Your bank is clean.
          </div>
        ) : (
          flags.map((f) => (
            <div key={f.questionId} className="rounded-xl border border-slate-200 bg-white p-5">
              {f.question ? (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        sourceColors[f.question.source] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {f.question.source}
                    </span>
                    <span className="text-slate-400">
                      {f.question.examCode} · {f.question.sectionCode} · {f.question.topic}
                    </span>
                  </div>
                  <p className="font-medium text-slate-900">{f.question.stem}</p>
                  <div className="mt-3 space-y-1.5">
                    {f.question.options.map((o, i) => (
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
                        {o.isCorrect && (
                          <span className="ml-auto text-xs font-semibold text-green-700">
                            ✓ Marked correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm italic text-slate-400">
                  This question was already deleted (id {f.questionId}).
                </p>
              )}

              {f.reason && (
                <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  <span className="font-semibold">Student note: </span>
                  {f.reason}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => act(f.questionId, "delete")}
                  disabled={busy === f.questionId}
                  className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Delete question
                </button>
                <button
                  onClick={() => act(f.questionId, "dismiss")}
                  disabled={busy === f.questionId}
                  className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Dismiss (it&apos;s fine)
                </button>
                <span className="ml-auto text-xs text-slate-400">
                  {new Date(f.at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
