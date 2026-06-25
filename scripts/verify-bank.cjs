const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const n = (x) => Number(x);

(async () => {
  const total = await p.question.count();
  console.log("=== QUESTION BANK INTEGRITY CHECK ===");
  console.log("Total questions:", total);

  // 1. Exact duplicate content-hash within an exam+section (anti-repeat guarantee)
  const dupHash = await p.$queryRawUnsafe(
    `SELECT COUNT(*) AS groups FROM (
       SELECT 1 FROM Question GROUP BY examCode, sectionCode, contentHash HAVING COUNT(*) > 1
     )`
  );
  console.log("\n[1] Duplicate content-hash groups within a section (must be 0):", n(dupHash[0].groups));

  // 2. Exact duplicate STEM text within an exam+section (near-duplicate catch)
  const extra = await p.$queryRawUnsafe(
    `SELECT COALESCE(SUM(c-1),0) AS extra FROM (
       SELECT COUNT(*) AS c FROM Question GROUP BY examCode, sectionCode, stem HAVING c > 1
     )`
  );
  const dupStemExamples = await p.$queryRawUnsafe(
    `SELECT examCode, sectionCode, stem, COUNT(*) AS c
       FROM Question GROUP BY examCode, sectionCode, stem HAVING c > 1
       ORDER BY c DESC LIMIT 8`
  );
  console.log("[2] Repeated identical stems within a section (extra copies):", n(extra[0].extra));
  for (const r of dupStemExamples)
    console.log(`     x${n(r.c)}  ${r.examCode}/${r.sectionCode}: ${String(r.stem).slice(0, 70)}`);

  // 3. Answer integrity — every question must have EXACTLY one correct option
  const badAns = await p.$queryRawUnsafe(
    `SELECT COUNT(*) AS bad FROM (
       SELECT questionId FROM "Option" GROUP BY questionId HAVING SUM(isCorrect) != 1
     )`
  );
  console.log("\n[3] Questions WITHOUT exactly one correct answer (must be 0):", n(badAns[0].bad));

  // 4. Questions with too few options
  const fewOpts = await p.$queryRawUnsafe(
    `SELECT COUNT(*) AS few FROM (
       SELECT questionId FROM "Option" GROUP BY questionId HAVING COUNT(*) < 4
     )`
  );
  console.log("[4] Questions with fewer than 4 options:", n(fewOpts[0].few));

  // 5. Sample a few AI-generated GK questions to eyeball factual correctness
  const sample = await p.question.findMany({
    where: { source: "AI", sectionCode: "general-awareness" },
    include: { options: { orderBy: { displayOrder: "asc" } } },
    take: 4,
  });
  console.log("\n[5] Sample AI General-Awareness questions (eyeball check):");
  for (const q of sample) {
    const correct = q.options.find((o) => o.isCorrect);
    console.log(`   Q: ${q.stem}`);
    console.log(`      Answer: ${correct ? correct.text : "??"}`);
  }

  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
