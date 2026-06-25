import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Daily automatic integrity sweep of the question bank (Postgres/Neon). Removes
// exact duplicates, broken option sets and repeated stems in curated sections,
// and reports answer-integrity health. Meant for Vercel Cron.
//
// Security: requires CRON_SECRET via `Authorization: Bearer <secret>` or `?key=`.
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  return auth === `Bearer ${secret}` || key === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Exact duplicates: same (examCode, sectionCode, contentHash) — keep lowest id.
  const dupRemoved = await prisma.$executeRawUnsafe(`
    DELETE FROM "Question" WHERE id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY "examCode","sectionCode","contentHash" ORDER BY id
        ) AS rn FROM "Question"
      ) t WHERE rn > 1
    )`);

  // 2. Broken option sets: a question with two identical option texts.
  const defectiveRemoved = await prisma.$executeRawUnsafe(`
    DELETE FROM "Question" WHERE id IN (
      SELECT DISTINCT o."questionId" FROM "Option" o
      WHERE EXISTS (
        SELECT 1 FROM "Option" o2
        WHERE o2."questionId" = o."questionId" AND o2.text = o.text AND o2.id <> o.id
      )
    )`);

  // 3. Answer integrity: a single-answer MCQ must have exactly one correct option.
  const brokenAnswerRemoved = await prisma.$executeRawUnsafe(`
    DELETE FROM "Question" WHERE id IN (
      SELECT "questionId" FROM "Option"
      GROUP BY "questionId"
      HAVING SUM(CASE WHEN "isCorrect" THEN 1 ELSE 0 END) <> 1
    )`);

  // 4. Repeated stems in curated sections (spelling items legitimately repeat) —
  //    keep one per (examCode, sectionCode, stem), preferring SEED/MANUAL over AI.
  const dupStems: { examCode: string; sectionCode: string; stem: string }[] =
    await prisma.$queryRawUnsafe(`
      SELECT "examCode","sectionCode",stem FROM "Question"
      WHERE "sectionCode" IN ('general-awareness','english','general-studies','computer')
        AND LOWER(stem) NOT LIKE '%spel%'
      GROUP BY "examCode","sectionCode",stem HAVING COUNT(*) > 1`);
  const rank = (s: string) => (s === "SEED" ? 0 : s === "MANUAL" ? 1 : 2);
  let stemsRemoved = 0;
  for (const g of dupStems) {
    const items = await prisma.question.findMany({
      where: { examCode: g.examCode, sectionCode: g.sectionCode, stem: g.stem },
      select: { id: true, source: true },
    });
    items.sort((a, b) => rank(a.source) - rank(b.source) || (a.id < b.id ? -1 : 1));
    const toDelete = items.slice(1).map((d) => d.id);
    if (toDelete.length) {
      await prisma.question.deleteMany({ where: { id: { in: toDelete } } });
      stemsRemoved += toDelete.length;
    }
  }

  const total = await prisma.question.count();
  return NextResponse.json({
    ok: true,
    removed: {
      exactDuplicates: dupRemoved,
      defectiveOptionSets: defectiveRemoved,
      brokenAnswers: brokenAnswerRemoved,
      repeatedStems: stemsRemoved,
    },
    totalQuestions: total,
    ranAt: new Date().toISOString(),
  });
}
