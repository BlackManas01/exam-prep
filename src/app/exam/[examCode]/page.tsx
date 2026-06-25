import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getExamBlueprint,
  sectionDurationSeconds,
  totalMarks,
  totalQuestions,
} from "@/lib/examConfig";
import StartTestForm from "@/components/StartTestForm";

export default async function ExamInstructionsPage({
  params,
}: {
  params: Promise<{ examCode: string }>;
}) {
  const { examCode } = await params;
  const exam = getExamBlueprint(examCode);
  if (!exam) notFound();

  const mins = Math.round(exam.totalDurationSeconds / 60);

  return (
    <main className="min-h-screen">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← All exams
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{exam.name}</h1>
          <p className="mt-1 text-slate-300">{exam.description}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-800">Exam Pattern</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Section</th>
                    <th className="px-4 py-2 font-semibold">Questions</th>
                    <th className="px-4 py-2 font-semibold">
                      {exam.hasSectionalTiming ? "Time" : "Marks"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exam.sections.map((s) => (
                    <tr key={s.code} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-800">{s.name}</td>
                      <td className="px-4 py-2 text-slate-600">{s.questionCount}</td>
                      <td className="px-4 py-2 text-slate-600">
                        {exam.hasSectionalTiming
                          ? `${Math.round(sectionDurationSeconds(exam, s) / 60)} min`
                          : s.questionCount * exam.marksPerCorrect}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-800">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2">{totalQuestions(exam)}</td>
                    <td className="px-4 py-2">
                      {exam.hasSectionalTiming ? `${mins} min` : totalMarks(exam)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-800">Instructions</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>
                The test duration is <strong>{mins} minutes</strong>. The timer
                starts as soon as you begin and the test auto-submits when time runs
                out.
              </li>
              <li>
                Each correct answer awards{" "}
                <strong>+{exam.marksPerCorrect}</strong> mark(s). Each wrong answer
                carries a penalty of{" "}
                <strong>−{exam.negativeMarkPerWrong.toFixed(2)}</strong>.
              </li>
              <li>
                Use the <strong>question palette</strong> to navigate. Colors show
                answered, not-answered, marked-for-review and not-visited states.
              </li>
              {exam.hasSectionalTiming ? (
                <li>
                  This exam has <strong>sectional timing</strong>. Each section has
                  its own time limit and you must stay within the current section.
                  When a section&apos;s time ends, it{" "}
                  <strong>locks automatically</strong> and you move to the next
                  section — you <strong>cannot return</strong> to a completed section.
                </li>
              ) : (
                <li>
                  You can move <strong>freely between all sections</strong> within
                  the overall time limit.
                </li>
              )}
              <li>
                You can <strong>mark questions for review</strong> and return to them
                later. Unanswered questions carry no penalty.
              </li>
              <li>All questions are single-correct multiple choice questions.</li>
            </ul>
          </div>
        </section>

        <aside className="lg:col-span-1">
          <StartTestForm
            examCode={exam.code}
            examName={exam.shortName}
            originalDurationSeconds={exam.totalDurationSeconds}
          />
        </aside>
      </div>
    </main>
  );
}
