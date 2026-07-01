const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  for (const sec of ["reasoning", "quant"]) {
    console.log(`\n== ssc-cgl-tier1 / ${sec} ==`);
    const g = await prisma.question.groupBy({ by: ["source", "difficulty", "isActive"], where: { examCode: "ssc-cgl-tier1", sectionCode: sec }, _count: true });
    g.sort((a,b)=>b._count-a._count).forEach((r) => console.log(`  ${r.source} ${r.difficulty} active=${r.isActive}: ${r._count}`));
    const active = await prisma.question.count({ where: { examCode: "ssc-cgl-tier1", sectionCode: sec, isActive: true } });
    const inactive = await prisma.question.count({ where: { examCode: "ssc-cgl-tier1", sectionCode: sec, isActive: false } });
    console.log(`  TOTAL active=${active} inactive=${inactive}`);
  }
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
