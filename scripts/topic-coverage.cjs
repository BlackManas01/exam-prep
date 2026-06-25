const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const secs = await p.question.groupBy({ by: ["sectionCode"], _count: true });
  console.log("Sections:");
  secs.sort((a, b) => b._count - a._count).forEach((s) => console.log("  " + s._count + "  " + s.sectionCode));
  for (const sc of ["math", "reasoning"]) {
    const rows = await p.question.groupBy({ by: ["topic"], where: { sectionCode: sc }, _count: true });
    if (!rows.length) continue;
    console.log("\n[" + sc + "] topics:");
    rows.sort((a, b) => b._count - a._count).forEach((r) => console.log("  " + r._count + "  " + r.topic));
  }
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
