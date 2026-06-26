const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  // Remove the specific wrong AI pipe question (all copies across exams).
  const ids = (await p.question.findMany({
    where: { stem: { contains: "both are opened for 4 hours and then A is closed" } },
    select: { id: true },
  })).map((r) => r.id);
  if (ids.length) {
    await p.option.deleteMany({ where: { questionId: { in: ids } } });
    await p.question.deleteMany({ where: { id: { in: ids } } });
  }
  console.log("Removed wrong AI pipe question copies:", ids.length);

  // Report source mix of HARD/EXPERT for tier1 (how much is AI vs hand-written).
  for (const sec of ["quant", "reasoning", "english"]) {
    const g = await p.question.groupBy({
      by: ["source"],
      where: { examCode: "ssc-cgl-tier1", sectionCode: sec, difficulty: { in: ["HARD", "EXPERT"] } },
      _count: true,
    });
    console.log(`${sec}:`, g.map((x) => `${x.source} ${x._count}`).join("  "));
  }
  await p.$disconnect();
})();
