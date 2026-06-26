const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const ids = (await p.question.findMany({ where: { stem: { contains: "divisible by both" } }, select: { id: true } })).map(r => r.id);
  await p.option.deleteMany({ where: { questionId: { in: ids } } });
  const r = await p.question.deleteMany({ where: { id: { in: ids } } });
  console.log("deleted divisible-by-both:", r.count);
  await p.$disconnect();
})();
