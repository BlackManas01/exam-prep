const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const APPLY = process.argv.includes("--apply");
(async () => {
  const sec = { in: ["quant","math","maths","reasoning","general-intelligence"] };
  const ids = (await p.question.findMany({
    where: { sectionCode: sec, difficulty: "EASY" },
    select: { id: true },
  })).map(r => r.id);
  console.log("EASY quant+reasoning to DELETE:", ids.length);
  if (!APPLY) { console.log("DRY RUN. add --apply"); await p.$disconnect(); return; }
  for (let i = 0; i < ids.length; i += 1000) {
    const chunk = ids.slice(i, i + 1000);
    await p.option.deleteMany({ where: { questionId: { in: chunk } } });
    await p.question.deleteMany({ where: { id: { in: chunk } } });
  }
  console.log("deleted:", ids.length);
  const byDiff = await p.question.groupBy({ by: ["difficulty"], where: { sectionCode: sec }, _count: true });
  console.log("Remaining quant+reasoning:");
  for (const d of byDiff) console.log(" ", d.difficulty, d._count);
  await p.$disconnect();
})();
