const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (const sec of ["quant", "reasoning", "english"]) {
    const rows = await p.question.findMany({
      where: { examCode: "ssc-cgl-tier1", sectionCode: sec, difficulty: { in: ["HARD", "EXPERT"] } },
      select: { topic: true, difficulty: true, stem: true, source: true },
      take: 10, orderBy: { id: "asc" },
    });
    console.log(`\n===== ssc-cgl-tier1 / ${sec} — HARD/EXPERT sample =====`);
    for (const r of rows) console.log(`[${r.difficulty}/${r.source}] ${r.stem.slice(0, 150)}`);
  }
  await p.$disconnect();
})();
