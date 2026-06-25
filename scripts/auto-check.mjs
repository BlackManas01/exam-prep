// Automatic duplicate & integrity checker. Runs on a schedule, auto-removes any
// true duplicate questions (same exam+section+content hash) that ever slip
// through, and reports answer-integrity health. Safe to run alongside the app.
//
//   npm run db:check:auto
//
// Env: CHECK_INTERVAL_MIN (default 30)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const INTERVAL_MIN = Number(process.env.CHECK_INTERVAL_MIN) || 30;

async function checkOnce() {
  const time = new Date().toLocaleTimeString();

  // 1. True duplicates = same (examCode, sectionCode, contentHash).
  const dupGroups = await prisma.$queryRawUnsafe(
    `SELECT examCode, sectionCode, contentHash, COUNT(*) AS c
       FROM Question GROUP BY examCode, sectionCode, contentHash HAVING c > 1`
  );

  let removed = 0;
  if (dupGroups.length > 0) {
    removed = dupGroups.reduce((a, r) => a + Number(r.c) - 1, 0);
    // Keep the lowest id per group, delete the rest (options cascade).
    await prisma.$executeRawUnsafe(`
      DELETE FROM Question WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (
            PARTITION BY examCode, sectionCode, contentHash ORDER BY id
          ) AS rn FROM Question
        ) WHERE rn > 1
      )`);
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Option" WHERE questionId NOT IN (SELECT id FROM Question)`
    );
  }

  // 2. Answer integrity: every question must have exactly one correct option.
  const badAns = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS bad FROM (
       SELECT questionId FROM "Option" GROUP BY questionId HAVING SUM(isCorrect) != 1
     )`
  );
  const bad = Number(badAns[0].bad);

  // 3. Defective options: a question with two identical option texts is broken
  //    (often factually-wrong AI output). Auto-remove the whole question.
  const dupOptRows = await prisma.$queryRawUnsafe(
    `SELECT DISTINCT questionId FROM "Option" o
       WHERE EXISTS (
         SELECT 1 FROM "Option" o2
         WHERE o2.questionId = o.questionId AND o2.text = o.text AND o2.id <> o.id
       )`
  );
  let removedDefective = 0;
  if (dupOptRows.length > 0) {
    const ids = dupOptRows.map((r) => r.questionId);
    await prisma.option.deleteMany({ where: { questionId: { in: ids } } });
    await prisma.question.deleteMany({ where: { id: { in: ids } } });
    removedDefective = ids.length;
  }

  // 4. Near-duplicate stems: the AI sometimes regenerates the same question with
  //    a reworded answer. Keep one per (examCode, sectionCode, stem) — preferring
  //    a verified SEED/MANUAL item over AI — in the curated subjects. Spelling
  //    questions legitimately share a stem (each item is a different word), so any
  //    "...correctly spelt/spelled word" stem is excluded from this dedup.
  const dupStemGroups = await prisma.$queryRawUnsafe(
    `SELECT examCode, sectionCode, stem
       FROM Question
       WHERE sectionCode IN ('general-awareness','english','general-studies','computer')
         AND LOWER(stem) NOT LIKE '%spel%'
       GROUP BY examCode, sectionCode, stem HAVING COUNT(*) > 1`
  );
  const rank = (s) => (s === "SEED" ? 0 : s === "MANUAL" ? 1 : 2);
  let removedStems = 0;
  for (const g of dupStemGroups) {
    const items = await prisma.question.findMany({
      where: { examCode: g.examCode, sectionCode: g.sectionCode, stem: g.stem },
      select: { id: true, source: true },
    });
    items.sort((a, b) => rank(a.source) - rank(b.source) || (a.id < b.id ? -1 : 1));
    const toDelete = items.slice(1).map((d) => d.id);
    if (toDelete.length) {
      await prisma.option.deleteMany({ where: { questionId: { in: toDelete } } });
      await prisma.question.deleteMany({ where: { id: { in: toDelete } } });
      removedStems += toDelete.length;
    }
  }

  const total = await prisma.question.count();

  if (removed > 0 || removedDefective > 0 || removedStems > 0) {
    const parts = [];
    if (removed > 0) parts.push(`${removed} duplicate(s)`);
    if (removedDefective > 0) parts.push(`${removedDefective} defective option set(s)`);
    if (removedStems > 0) parts.push(`${removedStems} repeated-stem near-dup(s)`);
    console.log(`${time}  ⚠ removed ${parts.join(" + ")}. Bank now ${total} questions.`);
  } else {
    console.log(
      `${time}  ✓ clean — 0 duplicates, ${total} questions` +
        (bad > 0 ? `  (⚠ ${bad} answer-integrity issues)` : ", answers OK")
    );
  }
}

console.log(`Auto duplicate-checker running every ${INTERVAL_MIN} min. Leave running; Ctrl+C to stop.`);
await checkOnce();
setInterval(
  () => checkOnce().catch((e) => console.error("check error:", e.message)),
  INTERVAL_MIN * 60 * 1000
);
