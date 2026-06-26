const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
// Same signature the test assembler uses to detect "same pattern".
function tmpl(s) {
  return s.replace(/₹?\d[\d.,/:]*/g, "#").replace(/\b[A-Z]\b/g, "@").replace(/[A-Z]{2,}/g, "@").replace(/\s+/g, " ").trim().slice(0, 70);
}
(async () => {
  for (const sec of ["quant", "reasoning", "english", "general-awareness"]) {
    const rows = await p.question.findMany({
      where: { examCode: "ssc-cgl-tier1", sectionCode: sec },
      select: { stem: true, source: true, difficulty: true },
    });
    const groups = {};
    const aiSet = new Set(), procSet = new Set();
    for (const r of rows) {
      const key = tmpl(r.stem);
      groups[key] = (groups[key] || 0) + 1;
      if (r.source === "AI") aiSet.add(key); else procSet.add(key);
    }
    const distinct = Object.keys(groups).length;
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    const over2 = sorted.filter(([, n]) => n > 2).length;
    console.log(`\n===== ${sec} =====`);
    console.log(`  questions: ${rows.length}`);
    console.log(`  DISTINCT templates: ${distinct}`);
    console.log(`  avg questions/template: ${(rows.length / distinct).toFixed(1)}`);
    console.log(`  templates with >2 copies: ${over2}`);
    console.log(`  (AI-unique templates: ${aiSet.size}, procedural/manual templates: ${procSet.size})`);
    console.log(`  top 5 most-repeated patterns:`);
    for (const [k, n] of sorted.slice(0, 5)) console.log(`     ${String(n).padStart(4)}×  ${k.slice(0, 60)}`);
  }
  await p.$disconnect();
})();
