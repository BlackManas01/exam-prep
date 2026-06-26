const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
function tmpl(s) {
  return s.replace(/₹?\d[\d.,/:]*/g, "#").replace(/\b[A-Z]\b/g, "@").replace(/[A-Z]{2,}/g, "@").replace(/\s+/g, " ").trim().slice(0, 70);
}
(async () => {
  for (const sec of ["quant", "english", "reasoning"]) {
    const rows = await p.question.findMany({
      where: { examCode: "ssc-cgl-tier1", sectionCode: sec, isActive: true },
      select: { stem: true, difficulty: true },
    });
    const diff = {};
    const t = new Set();
    for (const r of rows) { diff[r.difficulty] = (diff[r.difficulty] || 0) + 1; t.add(tmpl(r.stem)); }
    console.log(`\n=== ssc-cgl-tier1 / ${sec} ===`);
    console.log(`  total active: ${rows.length}`);
    console.log(`  distinct templates (patterns): ${t.size}`);
    console.log(`  avg questions per pattern: ${(rows.length / t.size).toFixed(2)}`);
    console.log(`  by difficulty: HARD ${diff.HARD || 0}, EXPERT ${diff.EXPERT || 0}, MEDIUM ${diff.MEDIUM || 0}, EASY ${diff.EASY || 0}`);
  }
  await p.$disconnect();
})();
