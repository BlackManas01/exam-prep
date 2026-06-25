const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (const sec of ["general-awareness", "english", "computer"]) {
    const n = await p.question.count({ where: { examCode: "ssc-cgl-tier2", sectionCode: sec } });
    const sample = await p.question.findMany({
      where: { examCode: "ssc-cgl-tier2", sectionCode: sec, source: "AI" },
      select: { stem: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
    console.log(`\n[${sec}] total ${n}`);
    for (const s of sample) console.log(`   - ${s.stem.slice(0, 95)}`);
  }
  await p.$disconnect();
})();
