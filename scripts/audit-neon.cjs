// Postgres-compatible integrity audit for the live Neon bank. REPORT ONLY — it
// changes nothing. Reports: exact duplicates, answer-integrity issues, option
// problems, and repeated stems in curated sections.
//
//   node scripts/audit-neon.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function scalar(sql) {
  const r = await prisma.$queryRawUnsafe(sql);
  return Number(r[0]?.n ?? 0);
}

(async () => {
  const total = await prisma.question.count();
  const totalOpts = await prisma.option.count();

  // 1. Exact duplicates: same (examCode, sectionCode, contentHash).
  const dupGroups = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS n FROM (
       SELECT 1 FROM "Question"
       GROUP BY "examCode","sectionCode","contentHash" HAVING COUNT(*) > 1
     ) t`
  ).then((r) => Number(r[0].n));
  const dupExtra = await scalar(
    `SELECT COALESCE(SUM(c-1),0)::int AS n FROM (
       SELECT COUNT(*) c FROM "Question"
       GROUP BY "examCode","sectionCode","contentHash" HAVING COUNT(*) > 1
     ) t`
  );

  // 2. Answer integrity: each question must have exactly ONE correct option.
  const badAnswers = await scalar(
    `SELECT COUNT(*)::int AS n FROM (
       SELECT "questionId" FROM "Option"
       GROUP BY "questionId"
       HAVING SUM(CASE WHEN "isCorrect" THEN 1 ELSE 0 END) <> 1
     ) t`
  );

  // 3. Wrong option count: a question should have >= 2 options (we use 4).
  const tooFewOpts = await scalar(
    `SELECT COUNT(*)::int AS n FROM (
       SELECT "questionId" FROM "Option"
       GROUP BY "questionId" HAVING COUNT(*) < 2
     ) t`
  );
  const noOpts = await scalar(
    `SELECT COUNT(*)::int AS n FROM "Question" q
       WHERE NOT EXISTS (SELECT 1 FROM "Option" o WHERE o."questionId" = q.id)`
  );

  // 4. Duplicate option text inside the same question (broken/ambiguous).
  const dupOptionText = await scalar(
    `SELECT COUNT(DISTINCT o."questionId")::int AS n FROM "Option" o
       WHERE EXISTS (
         SELECT 1 FROM "Option" o2
         WHERE o2."questionId" = o."questionId" AND o2.text = o.text AND o2.id <> o.id
       )`
  );

  // 5. Repeated stems in curated sections (spelling items legitimately repeat).
  const repeatedStems = await scalar(
    `SELECT COALESCE(SUM(c-1),0)::int AS n FROM (
       SELECT COUNT(*) c FROM "Question"
       WHERE "sectionCode" IN ('general-awareness','english','general-studies','computer')
         AND LOWER(stem) NOT LIKE '%spel%'
       GROUP BY "examCode","sectionCode",stem HAVING COUNT(*) > 1
     ) t`
  );

  console.log("================ NEON BANK AUDIT ================");
  console.log(`Total questions : ${total}`);
  console.log(`Total options   : ${totalOpts}`);
  console.log("------------------------------------------------");
  console.log(`Exact duplicates (groups / extra rows) : ${dupGroups} / ${dupExtra}`);
  console.log(`Answer-integrity issues (≠1 correct)   : ${badAnswers}`);
  console.log(`Questions with < 2 options             : ${tooFewOpts}`);
  console.log(`Questions with NO options              : ${noOpts}`);
  console.log(`Questions with duplicate option text   : ${dupOptionText}`);
  console.log(`Repeated stems in curated sections     : ${repeatedStems}`);
  console.log("================================================");
  const clean =
    dupExtra === 0 && badAnswers === 0 && tooFewOpts === 0 && noOpts === 0 && dupOptionText === 0;
  console.log(clean ? "✅ CLEAN — no structural or answer errors." : "⚠ Issues found (see above).");

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
