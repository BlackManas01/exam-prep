const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (const diff of ["HARD", "MEDIUM"]) {
    const rows = await p.question.findMany({
      where: { sectionCode: { in: ["reasoning", "general-intelligence"] }, difficulty: diff, source: "SEED" },
      select: { topic: true, stem: true }, take: 6, orderBy: { id: "asc" },
    });
    console.log(`\n===== reasoning ${diff}/SEED =====`);
    for (const r of rows) console.log(`[${r.topic}] ${r.stem.slice(0, 100)}`);
  }
  await p.$disconnect();
})();
