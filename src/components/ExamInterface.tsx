"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  text: string;
}
interface QuestionData {
  id: string;
  stem: string;
  subject: string;
  topic: string;
  options: Option[];
}
interface ItemData {
  itemId: string;
  displayOrder: number;
  sectionCode: string;
  selectedOptionId: string | null;
  markedForReview: boolean;
  visited: boolean;
  question: QuestionData;
}
interface ExamMeta {
  code: string;
  name: string;
  shortName: string;
  hasSectionalTiming: boolean;
  originalDurationSeconds: number;
  marksPerCorrect: number;
  negativeMarkPerWrong: number;
  optionsPerQuestion: number;
  sections: { code: string; name: string; questionCount: number; sectionDurationSeconds: number | null }[];
}
interface AttemptMeta {
  id: string;
  examCode: string;
  status: string;
  candidateName: string;
  durationSeconds: number;
  startedAt: string;
}

type ItemStatus = "not-visited" | "not-answered" | "answered" | "marked" | "answered-marked";

function statusOf(item: ItemData): ItemStatus {
  if (item.markedForReview && item.selectedOptionId) return "answered-marked";
  if (item.markedForReview) return "marked";
  if (item.selectedOptionId) return "answered";
  if (item.visited) return "not-answered";
  return "not-visited";
}

const paletteColor: Record<ItemStatus, string> = {
  "not-visited": "bg-slate-200 text-slate-700 border-slate-300",
  "not-answered": "bg-red-500 text-white border-red-600",
  answered: "bg-green-600 text-white border-green-700",
  marked: "bg-purple-600 text-white border-purple-700",
  "answered-marked": "bg-purple-600 text-white border-purple-700 ring-2 ring-green-400",
};

function fmtTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export default function ExamInterface({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<ExamMeta | null>(null);
  const [attempt, setAttempt] = useState<AttemptMeta | null>(null);
  const [items, setItems] = useState<ItemData[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const submittedRef = useRef(false);
  const storageKey = `attempt:${attemptId}`;

  // ---- Load attempt ----
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to load test");
        if (!active) return;
        if (data.attempt.status === "SUBMITTED") {
          router.replace(`/result/${attemptId}`);
          return;
        }

        // restore local answers if present
        let restored: ItemData[] = data.items;
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const map = JSON.parse(saved) as Record<
              string,
              { selectedOptionId: string | null; markedForReview: boolean; visited: boolean }
            >;
            restored = data.items.map((it: ItemData) =>
              map[it.itemId] ? { ...it, ...map[it.itemId] } : it
            );
          }
        } catch {
          /* ignore */
        }

        setExam(data.exam);
        setAttempt(data.attempt);
        setItems(restored);

        const endTime =
          new Date(data.attempt.startedAt).getTime() + data.attempt.durationSeconds * 1000;
        setTimeLeft(Math.round((endTime - Date.now()) / 1000));
        setLoading(false);
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Something went wrong");
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  // ---- Persist answers locally ----
  useEffect(() => {
    if (!items.length) return;
    const map: Record<string, object> = {};
    for (const it of items) {
      map[it.itemId] = {
        selectedOptionId: it.selectedOptionId,
        markedForReview: it.markedForReview,
        visited: it.visited,
      };
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(map));
    } catch {
      /* ignore quota */
    }
  }, [items, storageKey]);

  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const answers = items.map((it) => ({
      itemId: it.itemId,
      selectedOptionId: it.selectedOptionId,
      markedForReview: it.markedForReview,
      visited: it.visited,
      timeSpentSeconds: 0,
    }));
    const timeTaken = attempt ? attempt.durationSeconds - Math.max(0, timeLeft) : 0;
    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTakenSeconds: timeTaken }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error ?? "Submit failed");
      }
      localStorage.removeItem(storageKey);
      router.replace(`/result/${attemptId}`);
    } catch (e) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(e instanceof Error ? e.message : "Submit failed");
    }
  }, [attemptId, attempt, items, timeLeft, router, storageKey]);

  // ---- Timer (wall-clock based so it can't be cheated by reloading) ----
  useEffect(() => {
    if (loading || !attempt) return;
    const endTime =
      new Date(attempt.startedAt).getTime() + attempt.durationSeconds * 1000;
    const tick = () => {
      const tl = Math.round((endTime - Date.now()) / 1000);
      setTimeLeft(tl);
      if (tl <= 0) doSubmit();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [loading, attempt, doSubmit]);

  // mark current visited
  useEffect(() => {
    if (!items.length) return;
    setItems((prev) =>
      prev.map((it, idx) => (idx === current && !it.visited ? { ...it, visited: true } : it))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, items.length]);

  const sectionsWithItems = useMemo(() => {
    if (!exam) return [];
    return exam.sections.map((sec) => ({
      ...sec,
      indices: items
        .map((it, idx) => ({ it, idx }))
        .filter(({ it }) => it.sectionCode === sec.code)
        .map(({ idx }) => idx),
    }));
  }, [exam, items]);

  const counts = useMemo(() => {
    const c = { answered: 0, notAnswered: 0, marked: 0, notVisited: 0 };
    for (const it of items) {
      const s = statusOf(it);
      if (s === "answered" || s === "answered-marked") c.answered++;
      else if (s === "marked") c.marked++;
      else if (s === "not-answered") c.notAnswered++;
      else c.notVisited++;
    }
    return c;
  }, [items]);

  // ---- Sectional timing (e.g. SSC, IBPS PO) ----
  const isSectional = !!exam?.hasSectionalTiming;

  // Cumulative time windows per section. Section durations are scaled to the
  // chosen (possibly reduced) total time, so a shorter timer compresses every
  // section proportionally. When a section has no explicit duration, the total
  // is split equally (SSC: 60 min / 4 = 15 min each).
  const sectionWindows = useMemo(() => {
    if (!exam || !attempt) return [] as { code: string; start: number; end: number; dur: number }[];
    const n = exam.sections.length;
    const original = exam.originalDurationSeconds || attempt.durationSeconds;
    const scale = attempt.durationSeconds / original;
    let acc = 0;
    return exam.sections.map((s, i) => {
      const rawDur = s.sectionDurationSeconds ?? Math.floor(original / n);
      let dur = Math.round(rawDur * scale);
      const start = acc;
      acc += dur;
      // Pin the final section's end exactly to the total to absorb rounding.
      if (i === n - 1) {
        dur = attempt.durationSeconds - start;
        acc = attempt.durationSeconds;
      }
      return { code: s.code, start, end: acc, dur };
    });
  }, [exam, attempt]);

  const elapsed = attempt ? attempt.durationSeconds - timeLeft : 0;

  const activeSectionIndex = useMemo(() => {
    if (!isSectional || sectionWindows.length === 0) return -1;
    for (let i = 0; i < sectionWindows.length; i++) {
      if (elapsed < sectionWindows[i].end) return i;
    }
    return sectionWindows.length - 1;
  }, [isSectional, sectionWindows, elapsed]);

  const activeSectionCode =
    isSectional && activeSectionIndex >= 0 ? sectionWindows[activeSectionIndex].code : null;

  const sectionTimeLeft =
    isSectional && activeSectionIndex >= 0
      ? Math.max(0, sectionWindows[activeSectionIndex].end - elapsed)
      : 0;

  // When a section's time expires, jump to (and lock into) the next section.
  const lastSectionRef = useRef(-1);
  useEffect(() => {
    if (!isSectional || !exam || !items.length || activeSectionIndex < 0) return;
    if (activeSectionIndex !== lastSectionRef.current) {
      lastSectionRef.current = activeSectionIndex;
      const code = exam.sections[activeSectionIndex].code;
      const firstIdx = items.findIndex((it) => it.sectionCode === code);
      if (firstIdx >= 0) setCurrent(firstIdx);
    }
  }, [activeSectionIndex, isSectional, exam, items]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading your test…
      </div>
    );
  }
  if (error && !items.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-examblue px-4 py-2 text-sm font-semibold text-white"
        >
          Back to home
        </button>
      </div>
    );
  }

  const item = items[current];
  const currentSection = exam?.sections.find((s) => s.code === item.sectionCode);

  const setOption = (optionId: string) =>
    setItems((prev) =>
      prev.map((it, idx) => (idx === current ? { ...it, selectedOptionId: optionId } : it))
    );
  const clearResponse = () =>
    setItems((prev) =>
      prev.map((it, idx) => (idx === current ? { ...it, selectedOptionId: null } : it))
    );
  const toggleMark = () =>
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === current ? { ...it, markedForReview: !it.markedForReview } : it
      )
    );
  const inActiveSection = (idx: number) =>
    !isSectional || (!!items[idx] && items[idx].sectionCode === activeSectionCode);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= items.length) return;
    if (!inActiveSection(idx)) return; // section is locked
    setCurrent(idx);
  };
  const goNext = () => goTo(current + 1);
  const goPrev = () => goTo(current - 1);
  const saveAndNext = () => goNext();
  const markAndNext = () => {
    toggleMark();
    if (inActiveSection(current + 1)) setCurrent(current + 1);
  };

  const lowTime = timeLeft <= 60;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 lg:h-screen lg:overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-300 bg-white px-4 py-3">
        <div>
          <h1 className="text-sm font-bold text-slate-800 sm:text-base">{exam?.name}</h1>
          <p className="text-xs text-slate-500">
            Candidate: {attempt?.candidateName} · {exam?.shortName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSectional && (
            <div
              className={`rounded-lg px-4 py-2 text-center font-mono text-lg font-bold ${
                sectionTimeLeft <= 30 ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              <div className="text-[10px] font-sans font-medium uppercase tracking-wide text-slate-400">
                Section Time
              </div>
              {fmtTime(sectionTimeLeft)}
            </div>
          )}
          <div
            className={`rounded-lg px-4 py-2 text-center font-mono text-lg font-bold ${
              lowTime ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-800"
            }`}
          >
            <div className="text-[10px] font-sans font-medium uppercase tracking-wide text-slate-400">
              {isSectional ? "Total Time" : "Time Left"}
            </div>
            {fmtTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Section tabs */}
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2">
        {sectionsWithItems.map((sec, sIdx) => {
          const isActive = isSectional
            ? activeSectionIndex === sIdx
            : item.sectionCode === sec.code;
          const locked = isSectional && sIdx !== activeSectionIndex;
          const completed = isSectional && sIdx < activeSectionIndex;
          return (
            <button
              key={sec.code}
              disabled={locked}
              onClick={() => {
                if (locked) return;
                if (sec.indices.length) setCurrent(sec.indices[0]);
              }}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-examblue text-white"
                  : locked
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {locked && <span className="mr-1">{completed ? "✓" : "🔒"}</span>}
              {sec.name}
              {isSectional && isActive ? (
                <span className="ml-1 opacity-80">· {fmtTime(sectionTimeLeft)}</span>
              ) : !isSectional && sec.sectionDurationSeconds ? (
                <span className="ml-1 opacity-70">
                  ({Math.round(sec.sectionDurationSeconds / 60)}m)
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {isSectional && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-700">
          🔒 Sectional timing is active. You can attempt only the current section.
          When its time ends, it locks and you move to the next section — you
          cannot return.
        </div>
      )}

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Question area */}
        <main className="flex-1 p-4 sm:p-6 lg:overflow-y-auto">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-semibold text-slate-700">
                Question {current + 1}{" "}
                <span className="font-normal text-slate-400">of {items.length}</span>
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                {currentSection?.name} · {item.question.topic}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span className="rounded bg-green-50 px-2 py-0.5 text-green-700">
                +{exam?.marksPerCorrect}
              </span>
              <span className="rounded bg-red-50 px-2 py-0.5 text-red-700">
                −{exam?.negativeMarkPerWrong.toFixed(2)}
              </span>
            </div>

            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-900">
              {item.question.stem}
            </p>

            <div className="mt-5 space-y-3">
              {item.question.options.map((opt, i) => {
                const selected = item.selectedOptionId === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      selected
                        ? "border-examblue bg-blue-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${item.itemId}`}
                      checked={selected}
                      onChange={() => setOption(opt.id)}
                      className="h-4 w-4"
                    />
                    <span className="font-semibold text-slate-500">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="text-slate-800">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={markAndNext}
              className="rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100"
            >
              {item.markedForReview ? "Unmark & Next" : "Mark for Review & Next"}
            </button>
            <button
              onClick={clearResponse}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear Response
            </button>
            <div className="flex-1" />
            <button
              onClick={goPrev}
              disabled={!inActiveSection(current - 1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              onClick={saveAndNext}
              disabled={!inActiveSection(current + 1)}
              className="rounded-lg bg-examblue px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
            >
              Save &amp; Next →
            </button>
          </div>
        </main>

        {/* Palette */}
        <aside className="border-t border-slate-200 bg-white p-4 lg:flex lg:w-80 lg:flex-col lg:border-l lg:border-t-0 lg:overflow-hidden">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Legend color="bg-green-600" label={`Answered (${counts.answered})`} />
            <Legend color="bg-red-500" label={`Not Answered (${counts.notAnswered})`} />
            <Legend color="bg-purple-600" label={`Marked (${counts.marked})`} />
            <Legend color="bg-slate-200" label={`Not Visited (${counts.notVisited})`} textDark />
          </div>

          <div className="mt-4 max-h-72 overflow-y-auto pr-1 lg:max-h-none lg:flex-1 lg:min-h-0">
            {sectionsWithItems.map((sec, sIdx) => {
              const secCompleted = isSectional && sIdx < activeSectionIndex;
              const secLocked = isSectional && sIdx > activeSectionIndex;
              return (
                <div key={sec.code} className="mb-4">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {sec.name}
                    {secCompleted && <span className="text-green-600">✓</span>}
                    {secLocked && <span>🔒</span>}
                  </p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {sec.indices.map((idx) => {
                      const st = statusOf(items[idx]);
                      const locked =
                        isSectional && items[idx].sectionCode !== activeSectionCode;
                      return (
                        <button
                          key={idx}
                          disabled={locked}
                          onClick={() => goTo(idx)}
                          className={`flex h-9 w-9 items-center justify-center rounded border text-xs font-semibold ${
                            locked
                              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                              : paletteColor[st]
                          } ${current === idx ? "ring-2 ring-offset-1 ring-examblue" : ""}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="mt-4 w-full shrink-0 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
          >
            Submit Test
          </button>
        </aside>
      </div>

      {/* Submit confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Submit your test?</h3>
            <p className="mt-1 text-sm text-slate-500">
              Once submitted you cannot change your answers.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Answered" value={counts.answered} className="text-green-700" />
              <Stat label="Not Answered" value={counts.notAnswered} className="text-red-600" />
              <Stat label="Marked" value={counts.marked} className="text-purple-700" />
              <Stat label="Not Visited" value={counts.notVisited} className="text-slate-600" />
            </dl>
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Continue Test
              </button>
              <button
                onClick={doSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label, textDark }: { color: string; label: string; textDark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-4 w-4 rounded ${color}`} />
      <span className={textDark ? "text-slate-600" : "text-slate-600"}>{label}</span>
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-lg font-bold ${className ?? "text-slate-800"}`}>{value}</div>
    </div>
  );
}
