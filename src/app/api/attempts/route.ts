import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assembleAttempt, assembleSection } from "@/lib/assembly";
import { getExamBlueprint, sectionDurationSeconds, totalQuestions } from "@/lib/examConfig";
import { getCurrentUser } from "@/lib/auth";

const createSchema = z.object({
  examCode: z.string().min(1),
  level: z.enum(["REAL", "SLIGHTLY_HARDER", "TWO_X"]).default("REAL"),
  candidateName: z.string().trim().min(1).max(60).default("Candidate"),
  // Optional reduced time for pressure practice. Clamped server-side so it can
  // never exceed the exam's official duration.
  durationSeconds: z.number().int().positive().optional(),
  // Single-subject practice: restrict to one section with N questions.
  sectionCode: z.string().min(1).optional(),
  questionCount: z.number().int().min(1).max(100).optional(),
  // Practice option: use only hand-verified (non-AI) questions.
  verifiedOnly: z.boolean().default(false),
  // Topic-wise practice: drill a single topic within the section.
  topic: z.string().min(1).optional(),
  // Review practice: build the test from a specific list of question ids
  // (e.g. the user's previously-wrong questions). Scoped to one exam.
  questionIds: z.array(z.string().min(1)).min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { examCode, level, candidateName, durationSeconds, sectionCode, questionCount, verifiedOnly, topic, questionIds } =
    parsed.data;

  const sessionUser = await getCurrentUser();

  const blueprint = getExamBlueprint(examCode);
  if (!blueprint) {
    return NextResponse.json({ error: "Unknown exam" }, { status: 404 });
  }

  const isReview = !!questionIds && questionIds.length > 0;
  const isPractice = isReview || !!sectionCode;
  const section = sectionCode
    ? blueprint.sections.find((s) => s.code === sectionCode)
    : undefined;
  if (sectionCode && !section) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  // The timer can be shortened for pressure practice but NEVER lengthened
  // beyond the real-exam pace. Practice pace = the section's real per-question
  // time; full mock = the official total duration.
  const MIN_DURATION = 60;
  const realPacePerQuestion =
    blueprint.hasSectionalTiming && section
      ? sectionDurationSeconds(blueprint, section) / section.questionCount
      : blueprint.totalDurationSeconds / totalQuestions(blueprint);
  const practiceCount = isReview ? questionIds!.length : questionCount ?? section?.questionCount ?? 1;
  const practiceRealDuration = Math.round(realPacePerQuestion * practiceCount);
  const maxDuration = isPractice ? practiceRealDuration : blueprint.totalDurationSeconds;
  const chosenDuration = Math.min(
    maxDuration,
    Math.max(MIN_DURATION, durationSeconds ?? maxDuration)
  );

  let assembled;
  if (isReview) {
    const qs = await prisma.question.findMany({
      where: { id: { in: questionIds }, examCode, isActive: true },
      select: { id: true, sectionCode: true },
    });
    const shuffled = qs.sort(() => Math.random() - 0.5);
    assembled = shuffled.map((q, i) => ({ questionId: q.id, sectionCode: q.sectionCode, displayOrder: i }));
  } else if (sectionCode) {
    assembled = await assembleSection(
      examCode,
      sectionCode,
      level,
      questionCount ?? section!.questionCount,
      verifiedOnly,
      topic
    );
  } else {
    assembled = await assembleAttempt(examCode, level);
  }
  if (assembled.length === 0) {
    return NextResponse.json(
      { error: "No questions available yet for this selection." },
      { status: 409 }
    );
  }

  const attempt = await prisma.attempt.create({
    data: {
      examCode,
      level,
      userId: sessionUser?.id ?? null,
      candidateName: sessionUser?.name ?? candidateName,
      durationSeconds: chosenDuration,
      items: {
        create: assembled.map((a) => ({
          questionId: a.questionId,
          sectionCode: a.sectionCode,
          displayOrder: a.displayOrder,
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
}
