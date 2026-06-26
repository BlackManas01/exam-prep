const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const secs = await p.question.groupBy({
    by: ["sectionCode", "difficulty"],
    where: { examCode: "ssc-cgl-tier1" },
    _count: true,
  });
  const tot = {};
  const grid = {};
  for (const r of secs) {
    grid[r.sectionCode] ??= { EASY: 0, MEDIUM: 0, HARD: 0, EXPERT: 0 };
    grid[r.sectionCode][r.difficulty] = r._count;
    tot[r.sectionCode] = (tot[r.sectionCode] || 0) + r._count;
  }
  console.log("SSC CGL Tier 1 — questions per section:");
  for (const s of Object.keys(grid)) {
    const g = grid[s];
    console.log(`  ${s.padEnd(20)} total ${String(tot[s]).padStart(5)}  | M ${g.MEDIUM}  H ${g.HARD}  X ${g.EXPERT}  (E ${g.EASY})`);
  }
  await p.$disconnect();
})();
