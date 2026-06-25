// Reports topic coverage for every exam + section: how many distinct topics and
// how many questions each has, so we can spot any thin or missing area.
//
//   node scripts/coverage-report.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const rows = await prisma.question.groupBy({
    by: ["examCode", "sectionCode", "topic"],
    where: { isActive: true },
    _count: { _all: true },
  });

  // Organize: exam -> section -> [{topic,count}]
  const map = {};
  for (const r of rows) {
    map[r.examCode] ??= {};
    map[r.examCode][r.sectionCode] ??= [];
    map[r.examCode][r.sectionCode].push({ topic: r.topic, n: r._count._all });
  }

  for (const exam of Object.keys(map).sort()) {
    let examTotal = 0;
    const lines = [];
    for (const section of Object.keys(map[exam]).sort()) {
      const topics = map[exam][section].sort((a, b) => b.n - a.n);
      const secTotal = topics.reduce((s, t) => s + t.n, 0);
      examTotal += secTotal;
      lines.push(`  • ${section}  —  ${topics.length} topics, ${secTotal} Qs`);
      for (const t of topics) lines.push(`        - ${t.topic}: ${t.n}`);
    }
    console.log(`\n=== ${exam}  (${examTotal} active Qs) ===`);
    console.log(lines.join("\n"));
  }

  const grand = await prisma.question.count({ where: { isActive: true } });
  console.log(`\nGRAND TOTAL active questions: ${grand}`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
