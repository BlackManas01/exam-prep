const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const sec = { in: ["reasoning", "general-intelligence"] };
  const byDiff = await p.question.groupBy({ by: ["difficulty","source"], where: { sectionCode: sec }, _count: true });
  console.log("Reasoning distribution:");
  for (const d of byDiff) console.log(" ", d.difficulty, d.source, d._count);
  for (const diff of ["EASY","MEDIUM"]) {
    const rows = await p.question.findMany({ where: { sectionCode: sec, difficulty: diff, source: "SEED" }, select: { topic:true, stem:true }, take: 10, orderBy:{ createdAt:"desc" } });
    console.log(`\n=== SEED ${diff} (${rows.length}) ===`);
    for (const r of rows) console.log(`[${r.topic}] ${r.stem.slice(0,110)}`);
  }
  await p.$disconnect();
})();
