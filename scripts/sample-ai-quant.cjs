const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const rows = await p.question.findMany({
    where: { examCode: "ssc-cgl-tier1", sectionCode: "quant", source: "AI" },
    include: { options: { orderBy: { displayOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  for (const r of rows) {
    const correct = r.options.find((o) => o.isCorrect);
    console.log(`\n[${r.difficulty}/${r.topic}] ${r.stem}`);
    console.log(`   ✓ ${correct ? correct.text : "?"}`);
  }
  await p.$disconnect();
})();
