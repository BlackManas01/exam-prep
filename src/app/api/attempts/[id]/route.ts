import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExamBlueprint, totalQuestions } from "@/lib/examConfig";

// Returns the full attempt payload for the test screen. Option correctness and
// explanations are intentionally NOT included while the test is in progress.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { displayOrder: "asc" },
        include: {
          // load the question + options via a follow-up query for control
        },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const blueprint = getExamBlueprint(attempt.examCode);
  if (!blueprint) {
    return NextResponse.json({ error: "Unknown exam" }, { status: 404 });
  }

  const questionIds = attempt.items.map((i) => i.questionId);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: {
      id: true,
      stem: true,
      subject: true,
      topic: true,
      options: {
        orderBy: { displayOrder: "asc" },
        select: { id: true, text: true, displayOrder: true },
      },
    },
  });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  const items = attempt.items.map((item) => {
    const q = qMap.get(item.questionId)!;
    return {
      itemId: item.id,
      displayOrder: item.displayOrder,
      sectionCode: item.sectionCode,
      selectedOptionId: item.selectedOptionId,
      markedForReview: item.markedForReview,
      visited: item.visited,
      question: {
        id: q.id,
        stem: q.stem,
        subject: q.subject,
        topic: q.topic,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      },
    };
  });

  // Sections actually present in this attempt (a single-subject practice has
  // only one). Sectional timing applies ONLY to a full official mock (all
  // questions present); practice and review tests get free navigation.
  const sectionCodesInAttempt = new Set(attempt.items.map((i) => i.sectionCode));
  const attemptSections = blueprint.sections.filter((s) =>
    sectionCodesInAttempt.has(s.code)
  );
  const isFullMock = attempt.items.length === totalQuestions(blueprint);

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      examCode: attempt.examCode,
      level: attempt.level,
      status: attempt.status,
      candidateName: attempt.candidateName,
      durationSeconds: attempt.durationSeconds,
      startedAt: attempt.startedAt,
    },
    exam: {
      code: blueprint.code,
      name: blueprint.name,
      shortName: blueprint.shortName,
      hasSectionalTiming: blueprint.hasSectionalTiming && isFullMock,
      originalDurationSeconds: blueprint.totalDurationSeconds,
      marksPerCorrect: blueprint.marksPerCorrect,
      negativeMarkPerWrong: blueprint.negativeMarkPerWrong,
      optionsPerQuestion: blueprint.optionsPerQuestion,
      sections: attemptSections.map((s) => ({
        code: s.code,
        name: s.name,
        questionCount: s.questionCount,
        sectionDurationSeconds: s.sectionDurationSeconds ?? null,
      })),
    },
    items,
  });
}
