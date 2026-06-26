const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const byDiff = await p.question.groupBy({ by: ["difficulty","source"], where: { examCode: "ssc-cgl-tier1", sectionCode: "english" }, _count: true });
  console.log("ssc-cgl-tier1 English distribution:");
  for (const d of byDiff) console.log(" ", d.difficulty, d.source, d._count);
  for (const diff of ["EASY","MEDIUM","HARD"]) {
    const rows = await p.question.findMany({ where: { examCode:"ssc-cgl-tier1", sectionCode:"english", difficulty:diff }, select:{ topic:true, stem:true }, take: 8, orderBy:{ createdAt:"desc" } });
    console.log(`\n=== ${diff} (${rows.length}) ===`);
    for (const r of rows) console.log(`[${r.topic}] ${r.stem.slice(0,120)}`);
  }
  await p.$disconnect();
})();
