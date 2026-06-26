const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const qs = await p.question.findMany({
    where: { source: "MANUAL" },
    select: { id: true, sectionCode: true, _count: { select: { options: true } }, options: { select: { isCorrect: true } } },
  });
  let noOpts = 0, badCorrect = 0;
  const bySec = {};
  for (const q of qs) {
    const n = q._count.options;
    const correct = q.options.filter((o) => o.isCorrect).length;
    if (n === 0) noOpts++;
    if (n > 0 && correct !== 1) badCorrect++;
    bySec[q.sectionCode] = (bySec[q.sectionCode] || 0) + 1;
  }
  console.log("MANUAL questions:", qs.length);
  console.log("option-less:", noOpts, " wrong#correct:", badCorrect);
  console.log("by section:", bySec);
  await p.$disconnect();
})();
