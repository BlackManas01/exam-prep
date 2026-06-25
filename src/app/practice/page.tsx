"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  DIFFICULTY_LEVELS,
  DifficultyLevelKey,
  EXAM_BLUEPRINTS,
  getExamBlueprint,
  sectionDurationSeconds,
  totalQuestions,
} from "@/lib/examConfig";
import { getStudentName } from "@/lib/profile";

interface SubjectDef {
  subject: string;
  label: string;
  emoji: string;
  color: string;
}

const SUBJECTS: SubjectDef[] = [
  { subject: "Quantitative Aptitude", label: "Maths / Quantitative", emoji: "🔢", color: "bg-blue-100 text-blue-700" },
  { subject: "Reasoning", label: "Reasoning", emoji: "🧩", color: "bg-emerald-100 text-emerald-700" },
  { subject: "General Awareness", label: "General Knowledge (GK)", emoji: "🌍", color: "bg-amber-100 text-amber-700" },
  { subject: "English", label: "English", emoji: "🔤", color: "bg-rose-100 text-rose-700" },
  { subject: "General Studies", label: "General Studies (UPSC)", emoji: "📚", color: "bg-purple-100 text-purple-700" },
];

interface SubjectOption {
  examCode: string;
  examName: string;
  shortName: string;
  sectionCode: string;
  sectionName: string;
}

function optionsForSubject(subject: string): SubjectOption[] {
  const out: SubjectOption[] = [];
  for (const exam of EXAM_BLUEPRINTS) {
    for (const s of exam.sections) {
      if (s.subject === subject) {
        out.push({
          examCode: exam.code,
          examName: exam.name,
          shortName: exam.shortName,
          sectionCode: s.code,
          sectionName: s.name,
        });
      }
    }
  }
  return out;
}

const COUNT_OPTIONS = [10, 15, 25, 50];

// Real exam pace (seconds per question) for a subject section, so practice
// timing matches the actual exam (e.g. SSC CGL: 15 min for 25 questions).
function paceSecondsPerQuestion(o: SubjectOption | null): number {
  if (!o) return 48;
  const exam = getExamBlueprint(o.examCode);
  if (!exam) return 48;
  const section = exam.sections.find((s) => s.code === o.sectionCode);
  if (!section) return 48;
  if (exam.hasSectionalTiming) {
    return sectionDurationSeconds(exam, section) / section.questionCount;
  }
  return exam.totalDurationSeconds / totalQuestions(exam);
}

export default function PracticePage() {
  const router = useRouter();
  const [subject, setSubject] = useState<string | null>(null);
  const [option, setOption] = useState<SubjectOption | null>(null);
  const [count, setCount] = useState(25);
  const [level, setLevel] = useState<DifficultyLevelKey>("REAL");
  const [minutes, setMinutes] = useState(21);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [topics, setTopics] = useState<{ topic: string; count: number }[]>([]);
  const [topic, setTopic] = useState<string>(""); // "" = all topics
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => (subject ? optionsForSubject(subject) : []), [subject]);

  const suggestedMinutes = useMemo(
    () => Math.max(1, Math.round((count * paceSecondsPerQuestion(option)) / 60)),
    [count, option]
  );

  // Keep the timer aligned to the real-exam pace as the exam/count changes.
  useEffect(() => {
    setMinutes(suggestedMinutes);
  }, [suggestedMinutes]);

  // Load the available topics for the chosen exam section (and source filter).
  useEffect(() => {
    if (!option) {
      setTopics([]);
      return;
    }
    const params = new URLSearchParams({
      examCode: option.examCode,
      sectionCode: option.sectionCode,
      verifiedOnly: String(verifiedOnly),
    });
    let active = true;
    fetch(`/api/topics?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setTopics(Array.isArray(d.topics) ? d.topics : []);
      })
      .catch(() => active && setTopics([]));
    return () => {
      active = false;
    };
  }, [option, verifiedOnly]);

  // If the chosen topic is no longer available (exam/source changed), reset it.
  useEffect(() => {
    if (topic && !topics.some((t) => t.topic === topic)) setTopic("");
  }, [topics, topic]);

  function pickSubject(s: string) {
    setSubject(s);
    const opts = optionsForSubject(s);
    setOption(opts[0] ?? null);
    setTopic("");
  }

  function setCountWithTime(c: number) {
    setCount(c);
  }

  async function start() {
    if (!option) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examCode: option.examCode,
          sectionCode: option.sectionCode,
          level,
          questionCount: count,
          durationSeconds: Math.max(60, minutes * 60),
          verifiedOnly,
          candidateName: getStudentName() || "Candidate",
          ...(topic ? { topic } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Failed to start");
      router.push(`/test/${data.attemptId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← Home
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Practice by Subject</h1>
          <p className="mt-1 text-slate-300">
            Pick a subject, choose the exam, set how many questions and the timer — then
            practice that subject one at a time.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        {/* Step 1: subject */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            1. Choose a subject
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SUBJECTS.map((s) => (
              <button
                key={s.subject}
                onClick={() => pickSubject(s.subject)}
                className={`rounded-xl border p-4 text-center transition ${
                  subject === s.subject
                    ? "border-examblue bg-blue-50 ring-1 ring-examblue"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl">{s.emoji}</div>
                <div className="mt-1 text-xs font-semibold text-slate-700">{s.label}</div>
              </button>
            ))}
          </div>
        </section>

        {subject && (
          <>
            {/* Step 2: exam */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                2. Choose the exam
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {options.map((o) => (
                  <label
                    key={`${o.examCode}-${o.sectionCode}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      option?.examCode === o.examCode && option?.sectionCode === o.sectionCode
                        ? "border-examblue bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="exam"
                      checked={option?.examCode === o.examCode && option?.sectionCode === o.sectionCode}
                      onChange={() => setOption(o)}
                    />
                    <span>
                      <span className="font-semibold text-slate-800">{o.shortName}</span>
                      <span className="block text-xs text-slate-500">{o.sectionName}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Step 3: settings */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                3. Set up your practice
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Topic</p>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-examblue focus:outline-none focus:ring-1 focus:ring-examblue"
                  >
                    <option value="">All topics (mixed practice)</option>
                    {topics.map((t) => (
                      <option key={t.topic} value={t.topic}>
                        {t.topic} ({t.count})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-400">
                    Pick a single topic to drill a weak area (e.g. only Compound Interest), or keep
                    “All topics” for a mixed set.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Number of questions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COUNT_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCountWithTime(c)}
                        className={`rounded-lg border px-4 py-1.5 text-sm font-semibold transition ${
                          count === c
                            ? "border-examblue bg-blue-50 text-examblue"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Difficulty</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DIFFICULTY_LEVELS.map((lvl) => (
                      <button
                        key={lvl.key}
                        onClick={() => setLevel(lvl.key as DifficultyLevelKey)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          level === lvl.key
                            ? "border-examblue bg-blue-50 text-examblue"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Timer (minutes)</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={suggestedMinutes}
                      value={minutes}
                      onChange={(e) =>
                        setMinutes(
                          Math.max(1, Math.min(suggestedMinutes, Number(e.target.value) || 1))
                        )
                      }
                      className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-examblue focus:outline-none focus:ring-1 focus:ring-examblue"
                    />
                    <span className="text-xs text-slate-400">
                      real-exam pace = {suggestedMinutes} min (max) · lower it for extra pressure
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Question source</p>
                  <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-examblue"
                    />
                    <span className="text-sm">
                      <span className="font-semibold text-slate-800">✅ Verified questions only</span>
                      <span className="block text-xs text-slate-500">
                        Use only hand-checked questions (no AI-generated ones) for 100% trust.
                        Best for GK &amp; English revision; Maths &amp; Reasoning are already verified.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
              )}

              <button
                onClick={start}
                disabled={!option || loading}
                className="mt-5 w-full rounded-lg bg-examblue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Preparing…" : `Start ${count}-question practice`}
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
