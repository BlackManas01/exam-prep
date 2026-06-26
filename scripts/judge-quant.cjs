const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (const src of ["SEED", "AI"]) {
    for (const diff of ["HARD", "EXPERT"]) {
      const rows = await p.question.findMany({
        where: { sectionCode: { in: ["quant", "math", "maths"] }, difficulty: diff, source: src },
        select: { topic: true, stem: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      });
      console.log(`\n===== ${src} / ${diff} (${rows.length}) =====`);
      for (const r of rows) console.log(`\n[${r.topic}]\n${r.stem}`);
    }
  }
  // counts
  const total = await p.question.count({ where: { sectionCode: { in: ["quant","math","maths"] } } });
  const byDiff = await p.question.groupBy({ by: ["difficulty"], where: { sectionCode: { in: ["quant","math","maths"] } }, _count: true });
  console.log("\n\n===== COUNTS =====", "total quant:", total);
  for (const d of byDiff) console.log(d.difficulty, d._count);
  await p.$disconnect();
})();
