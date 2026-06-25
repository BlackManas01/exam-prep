const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const n = (x) => Number(x);

(async () => {
  const dup = await p.$queryRawUnsafe(
    `SELECT COUNT(*) AS n FROM (SELECT questionId FROM "Option" GROUP BY questionId, text HAVING COUNT(*) > 1)`
  );
  const badAns = await p.$queryRawUnsafe(
    `SELECT COUNT(*) AS n FROM (SELECT questionId FROM "Option" GROUP BY questionId HAVING SUM(isCorrect) != 1)`
  );
  const eng = await p.question.count({ where: { sectionCode: "english" } });
  const total = await p.question.count();
  console.log("Questions with duplicate option text (must be 0):", n(dup[0].n));
  console.log("Questions without exactly 1 correct answer (must be 0):", n(badAns[0].n));
  console.log("English questions now:", eng);
  console.log("Total questions:", total);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
