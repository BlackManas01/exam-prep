const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const ids = (await p.question.findMany({
    where: { sectionCode: "english", difficulty: "EASY" },
    select: { id: true },
  })).map(r => r.id);
  console.log("EASY english to delete:", ids.length);
  for (let i = 0; i < ids.length; i += 1000) {
    const chunk = ids.slice(i, i + 1000);
    await p.option.deleteMany({ where: { questionId: { in: chunk } } });
    await p.question.deleteMany({ where: { id: { in: chunk } } });
  }
  const byDiff = await p.question.groupBy({ by: ["difficulty"], where: { sectionCode: "english" }, _count: true });
  console.log("English now:");
  for (const d of byDiff) console.log(" ", d.difficulty, d._count);
  await p.$disconnect();
})();
