import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExamBlueprint } from "@/lib/examConfig";
import { scoreAttempt } from "@/lib/scoring";

// Full result breakdown including correctness and explanations. Only valid
// after the attempt has been submitted.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { items: { orderBy: { displayOrder: "asc" } } },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  if (attempt.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Attempt not yet submitted" }, { status: 409 });
  }

  const blueprint = getExamBlueprint(attempt.examCode);
  if (!blueprint) {
    return NextResponse.json({ error: "Unknown exam" }, { status: 404 });
  }

  const questionIds = attempt.items.map((i) => i.questionId);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { options: { orderBy: { displayOrder: "asc" } } },
  });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  const questionDetails = attempt.items.map((item) => {
    const q = qMap.get(item.questionId)!;
    const correctOption = q.options.find((o) => o.isCorrect);
    const isAttempted = item.selectedOptionId !== null;
    const isCorrect = isAttempted && item.selectedOptionId === correctOption?.id;
    return {
      questionId: q.id,
      displayOrder: item.displayOrder,
      sectionCode: item.sectionCode,
      topic: q.topic,
      stem: q.stem,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      selectedOptionId: item.selectedOptionId,
      correctOptionId: correctOption?.id ?? null,
      isAttempted,
      isCorrect,
      status: !isAttempted ? "unattempted" : isCorrect ? "correct" : "wrong",
      explanation: q.explanation,
      timeSpentSeconds: item.timeSpentSeconds,
    };
  });

  const summary = scoreAttempt(
    attempt.examCode,
    questionDetails.map((q) => ({
      sectionCode: q.sectionCode,
      isAttempted: q.isAttempted,
      isCorrect: q.isCorrect,
    }))
  );

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      examCode: attempt.examCode,
      level: attempt.level,
      candidateName: attempt.candidateName,
      submittedAt: attempt.submittedAt,
      durationSeconds: attempt.durationSeconds,
      timeTakenSeconds: attempt.timeTakenSeconds,
    },
    exam: {
      code: blueprint.code,
      name: blueprint.name,
      shortName: blueprint.shortName,
      marksPerCorrect: blueprint.marksPerCorrect,
      negativeMarkPerWrong: blueprint.negativeMarkPerWrong,
      sections: blueprint.sections.map((s) => ({ code: s.code, name: s.name })),
    },
    summary,
    questions: questionDetails,
  });
}
