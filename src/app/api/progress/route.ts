import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExamBlueprint } from "@/lib/examConfig";
import { getCurrentUser } from "@/lib/auth";

// Aggregated performance for the logged-in student. Private — scoped to the
// session user's own attempts (by userId), so no one can view another's data.
export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in", needsLogin: true }, { status: 401 });
  }

  const attempts = await prisma.attempt.findMany({
    where: { userId: sessionUser.id, status: "SUBMITTED" },
    orderBy: { submittedAt: "desc" },
    take: 60,
    include: { items: { select: { questionId: true, selectedOptionId: true, sectionCode: true } } },
  });

  if (attempts.length === 0) {
    return NextResponse.json({
      name: sessionUser.name,
      summary: { tests: 0, questions: 0, correct: 0, accuracy: 0, bestScorePct: 0 },
      recent: [],
      weakTopics: [],
      strongTopics: [],
    });
  }

  // Build correctness + topic map for every question seen across attempts.
  const allQIds = Array.from(new Set(attempts.flatMap((a) => a.items.map((i) => i.questionId))));
  const questions = await prisma.question.findMany({
    where: { id: { in: allQIds } },
    select: { id: true, topic: true, sectionCode: true, options: { where: { isCorrect: true }, select: { id: true } } },
  });
  const qMap = new Map(
    questions.map((q) => [q.id, { topic: q.topic, correctId: q.options[0]?.id ?? null }])
  );

  // Per-topic tallies (only over attempted questions).
  const topicTally = new Map<string, { attempted: number; correct: number }>();
  let totalAttempted = 0;
  let totalCorrect = 0;

  for (const a of attempts) {
    for (const it of a.items) {
      if (it.selectedOptionId == null) continue; // skip unattempted
      const q = qMap.get(it.questionId);
      if (!q) continue;
      const isCorrect = it.selectedOptionId === q.correctId;
      totalAttempted++;
      if (isCorrect) totalCorrect++;
      const t = topicTally.get(q.topic) ?? { attempted: 0, correct: 0 };
      t.attempted++;
      if (isCorrect) t.correct++;
      topicTally.set(q.topic, t);
    }
  }

  const recent = attempts.slice(0, 20).map((a) => {
    const bp = getExamBlueprint(a.examCode);
    return {
      id: a.id,
      exam: bp?.shortName ?? a.examCode,
      examName: bp?.name ?? a.examCode,
      submittedAt: a.submittedAt,
      scoredMarks: a.scoredMarks,
      totalMarks: a.totalMarks,
      accuracy: a.accuracy,
      correct: a.correctCount,
      wrong: a.wrongCount,
      unattempted: a.unattemptedCount,
      scorePct: a.totalMarks > 0 ? Math.round((a.scoredMarks / a.totalMarks) * 1000) / 10 : 0,
    };
  });

  const topics = Array.from(topicTally.entries())
    .map(([topic, t]) => ({
      topic,
      attempted: t.attempted,
      correct: t.correct,
      accuracy: t.attempted > 0 ? Math.round((t.correct / t.attempted) * 1000) / 10 : 0,
    }))
    .filter((t) => t.attempted >= 4); // need a few data points to be meaningful

  const weakTopics = [...topics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 8);
  const strongTopics = [...topics].sort((a, b) => b.accuracy - a.accuracy).slice(0, 6);

  const bestScorePct = Math.max(...recent.map((r) => r.scorePct), 0);

  return NextResponse.json({
    name: sessionUser.name,
    summary: {
      tests: attempts.length,
      questions: totalAttempted,
      correct: totalCorrect,
      accuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 1000) / 10 : 0,
      bestScorePct,
    },
    recent,
    weakTopics,
    strongTopics,
  });
}
