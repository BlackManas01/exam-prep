const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const manual = await prisma.question.count({ where: { examCode: "ssc-cgl-tier1", source: "MANUAL", isActive: true } });
  const manualExpert = await prisma.question.count({ where: { examCode: "ssc-cgl-tier1", source: "MANUAL", isActive: true, difficulty: "EXPERT" } });
  const bySection = await prisma.question.groupBy({ by: ["sectionCode"], where: { examCode: "ssc-cgl-tier1", source: "MANUAL", isActive: true }, _count: true });
  console.log("CGL Tier1 MANUAL active:", manual, "| EXPERT:", manualExpert);
  bySection.sort((a,b)=>b._count-a._count).forEach((s) => console.log(`  ${s.sectionCode}: ${s._count}`));
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
