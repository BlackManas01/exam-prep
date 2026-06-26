const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (const sec of ["quant", "english", "reasoning"]) {
    const g = await p.question.groupBy({
      by: ["difficulty"], where: { examCode: "ssc-cgl-tier1", sectionCode: sec, isActive: true }, _count: true,
    });
    const m = Object.fromEntries(g.map((x) => [x.difficulty, x._count]));
    console.log(`${sec.padEnd(9)} HARD ${m.HARD || 0}  EXPERT ${m.EXPERT || 0}  MEDIUM ${m.MEDIUM || 0}`);
  }
  await p.$disconnect();
})();
