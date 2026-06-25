"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DIFFICULTY_LEVELS, DifficultyLevelKey } from "@/lib/examConfig";
import { getStudentName, setStudentName } from "@/lib/profile";

export default function StartTestForm({
  examCode,
  examName,
  originalDurationSeconds,
}: {
  examCode: string;
  examName: string;
  originalDurationSeconds: number;
}) {
  const router = useRouter();
  const originalMinutes = Math.round(originalDurationSeconds / 60);
  const MIN_MINUTES = 5;
  const [name, setName] = useState("");
  const [level, setLevel] = useState<DifficultyLevelKey>("REAL");
  const [minutes, setMinutes] = useState(originalMinutes);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remember the student's name across tests so progress is tracked.
  useEffect(() => {
    const n = getStudentName();
    if (n) setName(n);
  }, []);

  const clampMinutes = (m: number) =>
    Math.max(MIN_MINUTES, Math.min(originalMinutes, Math.round(m || 0)));

  // Preset reductions (never above 100% of the official time).
  const presets = [
    { label: "Full", pct: 1 },
    { label: "-10%", pct: 0.9 },
    { label: "-25%", pct: 0.75 },
    { label: "-50%", pct: 0.5 },
  ];

  async function start() {
    setLoading(true);
    setError(null);
    const candidate = name.trim() || "Candidate";
    if (name.trim()) setStudentName(name.trim());
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examCode,
          level,
          candidateName: candidate,
          durationSeconds: clampMinutes(minutes) * 60,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to start test");
      router.push(`/test/${data.attemptId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Start {examName} Mock</h2>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Your name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Candidate"
          maxLength={60}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-examblue focus:outline-none focus:ring-1 focus:ring-examblue"
        />
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-slate-700">Difficulty level</legend>
        <div className="mt-2 space-y-2">
          {DIFFICULTY_LEVELS.map((lvl) => (
            <label
              key={lvl.key}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                level === lvl.key
                  ? "border-examblue bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="level"
                value={lvl.key}
                checked={level === lvl.key}
                onChange={() => setLevel(lvl.key as DifficultyLevelKey)}
                className="mt-0.5"
              />
              <span>
                <span className="font-semibold text-slate-800">{lvl.label}</span>
                <span className="block text-xs text-slate-500">{lvl.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-slate-700">
          Test duration
        </legend>
        <p className="mt-0.5 text-xs text-slate-500">
          Practice under more pressure with less time. Official time is{" "}
          <strong>{originalMinutes} min</strong> — you can only reduce it.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((p) => {
            const presetMin = clampMinutes(originalMinutes * p.pct);
            const active = minutes === presetMin;
            return (
              <button
                type="button"
                key={p.label}
                onClick={() => setMinutes(presetMin)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-examblue bg-blue-50 text-examblue"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {p.label}
                <span className="ml-1 opacity-70">({presetMin}m)</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-slate-600" htmlFor="custom-minutes">
            Custom (min):
          </label>
          <input
            id="custom-minutes"
            type="number"
            min={MIN_MINUTES}
            max={originalMinutes}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            onBlur={() => setMinutes((m) => clampMinutes(m))}
            className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-examblue focus:outline-none focus:ring-1 focus:ring-examblue"
          />
          <span className="text-xs text-slate-400">of {originalMinutes} min max</span>
        </div>
      </fieldset>

      <label className="mt-4 flex items-start gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5"
        />
        I have read the instructions and I am ready to begin the test.
      </label>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      <button
        onClick={start}
        disabled={!agree || loading}
        className="mt-4 w-full rounded-lg bg-examblue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "Preparing your test…" : "Begin Test"}
      </button>
    </div>
  );
}
