// Compact coverage summary: per exam -> per section, number of distinct topics
// and active questions. Flags sections that look thin.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const rows = await prisma.question.groupBy({
    by: ["examCode", "sectionCode", "topic"],
    where: { isActive: true },
    _count: { _all: true },
  });
  const map = {};
  for (const r of rows) {
    map[r.examCode] ??= {};
    map[r.examCode][r.sectionCode] ??= { topics: new Set(), n: 0 };
    map[r.examCode][r.sectionCode].topics.add(r.topic);
    map[r.examCode][r.sectionCode].n += r._count._all;
  }
  for (const exam of Object.keys(map).sort()) {
    let tot = 0;
    console.log(`\n=== ${exam} ===`);
    for (const sec of Object.keys(map[exam]).sort()) {
      const s = map[exam][sec];
      tot += s.n;
      const flag = s.n < 100 ? "  ⚠ thin" : "";
      console.log(`  ${sec.padEnd(28)} ${String(s.topics.size).padStart(4)} topics  ${String(s.n).padStart(7)} Qs${flag}`);
    }
    console.log(`  ${"TOTAL".padEnd(28)} ${" ".repeat(11)}${String(tot).padStart(7)} Qs`);
  }
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
