const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const rows = await p.question.findMany({
    where: { examCode: "ssc-cgl-tier2", sectionCode: "general-awareness", source: "AI" },
    select: { topic: true, stem: true },
    take: 12,
    orderBy: { createdAt: "desc" },
  });
  for (const r of rows) console.log(`[${r.topic}] ${r.stem.slice(0, 90)}`);
  const cnt = await p.question.count({
    where: { examCode: "ssc-cgl-tier2", sectionCode: "general-awareness", source: "AI" },
  });
  console.log(`\nAI GA questions in CGL T2: ${cnt}`);
  await p.$disconnect();
})();
