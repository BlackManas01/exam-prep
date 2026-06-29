import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Recently-added questions across ALL exams/sections — powers the "Pipeline"
// view so you can watch what the generator and hand-written batches add.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") ?? "AI"; // AI | MANUAL | SEED | "" (all)
  const examCode = searchParams.get("examCode") ?? undefined;
  const sectionCode = searchParams.get("sectionCode") ?? undefined;
  const days = Number(searchParams.get("days") ?? "0"); // 0 = no time limit
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  const where = {
    ...(source ? { source } : {}),
    ...(examCode ? { examCode } : {}),
    ...(sectionCode ? { sectionCode } : {}),
    ...(days > 0 ? { createdAt: { gte: new Date(Date.now() - days * 86400000) } } : {}),
  };

  const [total, questions, bySection] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { options: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.question.groupBy({ by: ["examCode", "sectionCode"], where, _count: true }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    bySection: bySection
      .map((b) => ({ examCode: b.examCode, sectionCode: b.sectionCode, count: b._count }))
      .sort((a, b) => b.count - a.count),
    questions: questions.map((q) => ({
      id: q.id,
      stem: q.stem,
      examCode: q.examCode,
      sectionCode: q.sectionCode,
      topic: q.topic,
      difficulty: q.difficulty,
      source: q.source,
      explanation: q.explanation,
      createdAt: q.createdAt,
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    })),
  });
}
