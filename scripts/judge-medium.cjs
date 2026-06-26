const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (const src of ["SEED", "AI"]) {
    const rows = await p.question.findMany({
      where: { sectionCode: { in: ["quant", "math", "maths"] }, difficulty: "MEDIUM", source: src },
      select: { topic: true, stem: true },
      take: 15,
      orderBy: { createdAt: "desc" },
    });
    console.log(`\n===== ${src} / MEDIUM (showing ${rows.length}) =====`);
    for (const r of rows) console.log(`[${r.topic}] ${r.stem.slice(0,140)}`);
  }
  // count single-line procedural by source
  const seedMed = await p.question.count({ where: { sectionCode: { in: ["quant","math","maths"] }, difficulty: "MEDIUM", source: "SEED" } });
  const aiMed = await p.question.count({ where: { sectionCode: { in: ["quant","math","maths"] }, difficulty: "MEDIUM", source: "AI" } });
  console.log("\nMEDIUM SEED:", seedMed, " MEDIUM AI:", aiMed);
  await p.$disconnect();
})();
