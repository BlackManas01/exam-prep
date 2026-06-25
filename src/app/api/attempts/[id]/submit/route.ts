import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { scoreAttempt } from "@/lib/scoring";

const submitSchema = z.object({
  timeTakenSeconds: z.number().int().min(0).default(0),
  answers: z
    .array(
      z.object({
        itemId: z.string().min(1),
        selectedOptionId: z.string().nullable().default(null),
        markedForReview: z.boolean().default(false),
        visited: z.boolean().default(false),
        timeSpentSeconds: z.number().int().min(0).default(0),
      })
    )
    .default([]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { answers, timeTakenSeconds } = parsed.data;

  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  if (attempt.status === "SUBMITTED") {
    return NextResponse.json({ attemptId: attempt.id, alreadySubmitted: true });
  }

  // Map client answers to items.
  const answerMap = new Map(answers.map((a) => [a.itemId, a]));

  // Determine correct option per relevant question.
  const questionIds = attempt.items.map((i) => i.questionId);
  const correctOptions = await prisma.option.findMany({
    where: { questionId: { in: questionIds }, isCorrect: true },
    select: { id: true, questionId: true },
  });
  const correctByQuestion = new Map(correctOptions.map((o) => [o.questionId, o.id]));

  const evaluated = attempt.items.map((item) => {
    const ans = answerMap.get(item.id);
    const selectedOptionId = ans?.selectedOptionId ?? null;
    const isAttempted = selectedOptionId !== null;
    const isCorrect =
      isAttempted && correctByQuestion.get(item.questionId) === selectedOptionId;
    return { item, ans, selectedOptionId, isAttempted, isCorrect };
  });

  const summary = scoreAttempt(
    attempt.examCode,
    evaluated.map((e) => ({
      sectionCode: e.item.sectionCode,
      isAttempted: e.isAttempted,
      isCorrect: e.isCorrect,
    }))
  );

  await prisma.$transaction([
    ...evaluated.map((e) =>
      prisma.attemptItem.update({
        where: { id: e.item.id },
        data: {
          selectedOptionId: e.selectedOptionId,
          markedForReview: e.ans?.markedForReview ?? false,
          visited: e.ans?.visited ?? e.selectedOptionId !== null,
          timeSpentSeconds: e.ans?.timeSpentSeconds ?? 0,
        },
      })
    ),
    prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        totalMarks: summary.totalMarks,
        scoredMarks: summary.scoredMarks,
        correctCount: summary.correctCount,
        wrongCount: summary.wrongCount,
        unattemptedCount: summary.unattemptedCount,
        accuracy: summary.accuracy,
        timeTakenSeconds,
      },
    }),
  ]);

  return NextResponse.json({ attemptId: attempt.id, summary });
}
