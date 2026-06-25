import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EXAM_BLUEPRINTS } from "@/lib/examConfig";

// Per exam/section question counts (active + AI-pending), for the admin panel.
export async function GET() {
  const grouped = await prisma.question.groupBy({
    by: ["examCode", "sectionCode", "source", "isActive"],
    _count: { _all: true },
  });

  type Cell = { total: number; active: number; aiPending: number };
  const map = new Map<string, Cell>();
  const key = (e: string, s: string) => `${e}::${s}`;

  for (const g of grouped) {
    const k = key(g.examCode, g.sectionCode);
    const cell = map.get(k) ?? { total: 0, active: 0, aiPending: 0 };
    cell.total += g._count._all;
    if (g.isActive) cell.active += g._count._all;
    if (g.source === "AI" && !g.isActive) cell.aiPending += g._count._all;
    map.set(k, cell);
  }

  const exams = EXAM_BLUEPRINTS.map((exam) => ({
    code: exam.code,
    name: exam.name,
    sections: exam.sections.map((s) => {
      const cell = map.get(key(exam.code, s.code)) ?? { total: 0, active: 0, aiPending: 0 };
      return { code: s.code, name: s.name, subject: s.subject, ...cell };
    }),
  }));

  const total = await prisma.question.count();
  return NextResponse.json({ total, exams });
}
