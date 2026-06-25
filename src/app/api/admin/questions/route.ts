import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Paginated viewer for the question bank (used by the admin "Browse" page).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const examCode = searchParams.get("examCode") ?? undefined;
  const sectionCode = searchParams.get("sectionCode") ?? undefined;
  const source = searchParams.get("source") ?? undefined; // SEED | AI | MANUAL
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));

  if (!examCode || !sectionCode) {
    return NextResponse.json({ error: "examCode and sectionCode required" }, { status: 400 });
  }

  const where = {
    examCode,
    sectionCode,
    ...(source ? { source } : {}),
  };

  const [total, questions] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { options: { orderBy: { displayOrder: "asc" } } },
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    questions: questions.map((q) => ({
      id: q.id,
      stem: q.stem,
      topic: q.topic,
      difficulty: q.difficulty,
      source: q.source,
      explanation: q.explanation,
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    })),
  });
}
