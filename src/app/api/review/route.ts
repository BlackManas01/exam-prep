import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExamBlueprint } from "@/lib/examConfig";
import { getCurrentUser } from "@/lib/auth";

// The logged-in student's "mistake notebook": every question they answered
// WRONG across their attempts, with the correct answer + explanation, so they
// can learn and re-practice. Private (session user only).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in", needsLogin: true }, { status: 401 });
  }

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id, status: "SUBMITTED" },
    orderBy: { submittedAt: "desc" },
    take: 60,
    select: {
      examCode: true,
      items: { select: { questionId: true, selectedOptionId: true } },
    },
  });

  if (attempts.length === 0) {
    return NextResponse.json({ total: 0, exams: [], questions: [] });
  }

  // Correct option per question.
  const allQIds = Array.from(new Set(attempts.flatMap((a) => a.items.map((i) => i.questionId))));
  const questions = await prisma.question.findMany({
    where: { id: { in: allQIds } },
    select: {
      id: true,
      examCode: true,
      sectionCode: true,
      topic: true,
      stem: true,
      explanation: true,
      options: { orderBy: { displayOrder: "asc" }, select: { id: true, text: true, isCorrect: true } },
    },
  });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  // Collect the latest wrong answer per question (attempts are newest-first).
  const wrong = new Map<string, { selectedOptionId: string | null }>();
  for (const a of attempts) {
    for (const it of a.items) {
      if (it.selectedOptionId == null) continue; // skip unattempted
      if (wrong.has(it.questionId)) continue; // already recorded (latest)
      const q = qMap.get(it.questionId);
      if (!q) continue;
      const correct = q.options.find((o) => o.isCorrect);
      if (it.selectedOptionId !== correct?.id) {
        wrong.set(it.questionId, { selectedOptionId: it.selectedOptionId });
      }
    }
  }

  const out = Array.from(wrong.entries())
    .map(([qid, info]) => {
      const q = qMap.get(qid)!;
      const bp = getExamBlueprint(q.examCode);
      const correct = q.options.find((o) => o.isCorrect);
      const your = q.options.find((o) => o.id === info.selectedOptionId);
      return {
        questionId: qid,
        examCode: q.examCode,
        exam: bp?.shortName ?? q.examCode,
        sectionCode: q.sectionCode,
        topic: q.topic,
        stem: q.stem,
        options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        yourAnswer: your?.text ?? "(not recorded)",
        correctAnswer: correct?.text ?? "",
        explanation: q.explanation,
      };
    })
    .slice(0, 200);

  // Group exam summaries (for the "re-practice" buttons).
  const examMap = new Map<string, { exam: string; questionIds: string[] }>();
  for (const w of out) {
    const e = examMap.get(w.examCode) ?? { exam: w.exam, questionIds: [] };
    e.questionIds.push(w.questionId);
    examMap.set(w.examCode, e);
  }
  const exams = Array.from(examMap.entries()).map(([examCode, v]) => ({
    examCode,
    exam: v.exam,
    count: v.questionIds.length,
    questionIds: v.questionIds,
  }));

  return NextResponse.json({ total: out.length, exams, questions: out });
}
