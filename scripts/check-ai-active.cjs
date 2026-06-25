const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const ai = await p.question.groupBy({
    by: ["subject", "isActive"],
    where: { source: { in: ["AI", "MANUAL"] } },
    _count: { _all: true },
  });
  for (const g of ai) console.log(`${g.subject} | active=${g.isActive} | ${g._count._all}`);
  const total = await p.question.count();
  const activeTotal = await p.question.count({ where: { isActive: true } });
  console.log(`\nTotal: ${total} | Active (visible to students): ${activeTotal}`);
  await p.$disconnect();
})();
