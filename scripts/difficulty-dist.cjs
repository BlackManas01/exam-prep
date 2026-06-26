const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const rows = await p.question.groupBy({
    by: ["sectionCode", "difficulty", "source"],
    where: { sectionCode: { in: ["quant", "maths", "math", "reasoning", "general-intelligence"] } },
    _count: { _all: true },
  });
  const m = {};
  for (const r of rows) {
    const k = r.sectionCode;
    m[k] ??= {};
    const dk = `${r.difficulty}/${r.source}`;
    m[k][dk] = (m[k][dk] || 0) + r._count._all;
  }
  for (const sec of Object.keys(m).sort()) {
    console.log(`\n[${sec}]`);
    for (const dk of Object.keys(m[sec]).sort()) console.log(`  ${dk}: ${m[sec][dk]}`);
  }
  await p.$disconnect();
})();
