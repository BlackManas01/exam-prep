import Link from "next/link";
import { EXAM_BLUEPRINTS, totalMarks, totalQuestions } from "@/lib/examConfig";
import AuthNav from "@/components/AuthNav";

const categoryColors: Record<string, string> = {
  SSC: "bg-blue-100 text-blue-700",
  BANKING: "bg-emerald-100 text-emerald-700",
  RAILWAYS: "bg-amber-100 text-amber-700",
  UPSC: "bg-purple-100 text-purple-700",
};

function fmtDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

export default function HomePage() {
  const exams = [...EXAM_BLUEPRINTS].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <main className="min-h-screen">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-bold tracking-tight text-white">ExamPrep</span>
            <AuthNav />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
            AI-Powered Exam Simulation
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Government Exam Mock Test Platform
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Practice in an environment that mirrors the real exam — same section
            order, timing, question palette and marking scheme. Choose an exam to
            begin a full-length mock test.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-examnavy transition hover:bg-slate-100"
            >
              🎯 Practice by Subject (Maths · Reasoning · GK · English)
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              📊 My Progress
            </Link>
            <Link
              href="/current-affairs"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              📰 Current Affairs
            </Link>
            <Link
              href="/review"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              📕 Review Mistakes
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Practice one subject at a time</h2>
              <p className="text-sm text-slate-500">
                Test a single subject (e.g. only GK or only English), choose the exam, set
                the number of questions and your own timer.
              </p>
            </div>
            <Link
              href="/practice"
              className="rounded-lg bg-examblue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start subject practice →
            </Link>
          </div>
        </div>

        <h2 className="mb-6 text-xl font-semibold text-slate-800">Full-Length Mock Tests</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Link
              key={exam.code}
              href={`/exam/${exam.code}`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-examblue hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    categoryColors[exam.category] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {exam.category}
                </span>
                <span className="text-xs text-slate-400">
                  {exam.hasSectionalTiming ? "Sectional timing" : "Overall timing"}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-examblue">
                {exam.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {exam.description}
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                <div>
                  <dt className="text-xs text-slate-400">Questions</dt>
                  <dd className="text-sm font-bold text-slate-800">
                    {totalQuestions(exam)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Marks</dt>
                  <dd className="text-sm font-bold text-slate-800">{totalMarks(exam)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Time</dt>
                  <dd className="text-sm font-bold text-slate-800">
                    {fmtDuration(exam.totalDurationSeconds)}
                  </dd>
                </div>
              </dl>
              <span className="mt-4 inline-flex items-center justify-center rounded-lg bg-examblue px-4 py-2 text-sm font-semibold text-white">
                Start Mock Test →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        ExamPrep — free mock tests &amp; practice for SSC, Banking, Railways &amp; UPSC
        aspirants. Made for students. 💙
      </footer>
    </main>
  );
}
