const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const NEEDLES = [
  "If 1 = 5, 2 = 25",            // viral trick, ambiguous — not SSC
  "Find the remainder when 15! is divided by 17", // Wilson's theorem — olympiad, not SSC
];
(async () => {
  for (const needle of NEEDLES) {
    const ids = (await p.question.findMany({ where: { stem: { contains: needle } }, select: { id: true } })).map((r) => r.id);
    if (ids.length) {
      await p.option.deleteMany({ where: { questionId: { in: ids } } });
      await p.question.deleteMany({ where: { id: { in: ids } } });
    }
    console.log(`Removed ${ids.length} for: "${needle.slice(0, 40)}"`);
  }
  await p.$disconnect();
})();
