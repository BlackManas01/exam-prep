const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  // Find MANUAL english questions that have no options (broken from the failed run).
  const qs = await p.question.findMany({
    where: { sectionCode: "english", source: "MANUAL" },
    select: { id: true, _count: { select: { options: true } } },
  });
  const broken = qs.filter((q) => q._count.options === 0).map((q) => q.id);
  console.log("Broken option-less MANUAL english questions:", broken.length);
  for (let i = 0; i < broken.length; i += 1000) {
    await p.question.deleteMany({ where: { id: { in: broken.slice(i, i + 1000) } } });
  }
  console.log("deleted", broken.length);
  await p.$disconnect();
})();
