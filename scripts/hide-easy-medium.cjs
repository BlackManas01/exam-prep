const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SECS = ["quant", "math", "maths", "english", "reasoning", "general-intelligence"];
(async () => {
  const where = { sectionCode: { in: SECS }, difficulty: { in: ["EASY", "MEDIUM"] }, isActive: true };
  const n = await p.question.count({ where });
  console.log(`EASY/MEDIUM active in quant/english/reasoning (all exams): ${n}`);
  if (!APPLY) { console.log("DRY RUN — add --apply to deactivate (reversible)."); await p.$disconnect(); return; }
  const r = await p.question.updateMany({ where, data: { isActive: false } });
  console.log(`Deactivated ${r.count} (hidden from tests, not deleted).`);
  // Report tier1 remaining
  for (const sec of ["quant", "english", "reasoning"]) {
    const g = await p.question.groupBy({ by: ["difficulty"], where: { examCode: "ssc-cgl-tier1", sectionCode: sec, isActive: true }, _count: true });
    const m = Object.fromEntries(g.map((x) => [x.difficulty, x._count]));
    console.log(`  tier1 ${sec}: HARD ${m.HARD || 0}, EXPERT ${m.EXPERT || 0}, total ${(m.HARD || 0) + (m.EXPERT || 0)}`);
  }
  await p.$disconnect();
})().catch(async (e) => { console.error(e.message); await p.$disconnect(); process.exit(1); });
