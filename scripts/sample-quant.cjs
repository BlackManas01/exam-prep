const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (const diff of ["EASY", "MEDIUM", "HARD", "EXPERT"]) {
    const rows = await p.question.findMany({
      where: { sectionCode: "quant", difficulty: diff, source: "SEED" },
      select: { topic: true, stem: true },
      take: 4,
      orderBy: { id: "asc" },
    });
    console.log(`\n===== ${diff} (quant/SEED) =====`);
    for (const r of rows) console.log(`[${r.topic}] ${r.stem.slice(0, 110)}`);
  }
  await p.$disconnect();
})();
